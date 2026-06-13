// Built by vsrupeshkumar
// Surgical Node deployer for the RWAkins AI × RWA credit suite. Foundry isn't
// always available, so this uses ethers v6 (already a dep) + the solc-compiled
// artifacts in ./suite-build to deploy ONLY the three new contracts
// (RWAkinsCompliance, RWAkinsCreditPassport, RWAkinsLending), REUSING the existing
// live usdy/meth/amm/vault from lib/rwa-deployed.json so the current vault state is
// untouched. It then seeds the lending USDY reserve, KYC-attests the deployer, and
// merges the three new addresses back into lib/rwa-deployed.json.
//
//   node contracts/deploy-suite.mjs --check     # preflight only (no broadcast)
//   node contracts/deploy-suite.mjs             # deploy + seed + write addresses
import { ethers } from 'ethers'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DEPLOYED_JSON = join(ROOT, 'lib', 'rwa-deployed.json')
const RPCS = [
  'https://rpc.sepolia.mantle.xyz',
  'https://mantle-sepolia.drpc.org',
  'https://mantle-sepolia.gateway.tenderly.co',
]
const CHAIN_ID = 5003
const CHECK = process.argv.includes('--check')

function loadEnv() {
  // Minimal .env.local parser (no dotenv dependency).
  const env = { ...process.env }
  try {
    for (const line of readFileSync(join(ROOT, '.env.local'), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !env[m[1]]) env[m[1]] = m[2].trim()
    }
  } catch { /* no .env.local — rely on process.env */ }
  return env
}

function artifact(name) {
  const base = join(__dirname, 'suite-build', `src_${name}_sol_${name}`)
  const abi = JSON.parse(readFileSync(`${base}.abi`, 'utf8'))
  let bin = readFileSync(`${base}.bin`, 'utf8').trim()
  if (!bin.startsWith('0x')) bin = '0x' + bin
  return { abi, bin }
}

async function getProvider() {
  let lastErr
  for (const url of RPCS) {
    try {
      const p = new ethers.JsonRpcProvider(url, { chainId: CHAIN_ID, name: 'mantle-sepolia' }, { staticNetwork: true })
      await p.getBlockNumber()
      return p
    } catch (e) { lastErr = e }
  }
  throw new Error(`No reachable Mantle Sepolia RPC: ${lastErr?.message ?? lastErr}`)
}

async function main() {
  const env = loadEnv()
  const pk = (env.DEPLOYER_PRIVATE_KEY || '').trim()
  if (!/^0x[0-9a-fA-F]{64}$/.test(pk)) throw new Error('DEPLOYER_PRIVATE_KEY missing/invalid in .env.local')

  const deployed = JSON.parse(readFileSync(DEPLOYED_JSON, 'utf8'))
  for (const k of ['usdy', 'meth', 'amm', 'vault']) {
    if (!(typeof deployed[k] === 'string' && deployed[k].length === 42)) throw new Error(`Existing ${k} address missing in rwa-deployed.json`)
  }

  const provider = await getProvider()
  const wallet = new ethers.Wallet(pk, provider)
  const bal = await provider.getBalance(wallet.address)
  const net = await provider.getNetwork()

  console.log('— Preflight —')
  console.log('  deployer :', wallet.address)
  console.log('  balance  :', ethers.formatEther(bal), 'MNT')
  console.log('  chainId  :', net.chainId.toString())
  console.log('  reusing  : usdy', deployed.usdy, '| meth', deployed.meth, '| amm', deployed.amm, '| vault', deployed.vault)

  // Confirm this key actually controls the existing deployment.
  try {
    const vaultOwner = await new ethers.Contract(deployed.vault, ['function owner() view returns (address)'], provider).owner()
    const match = vaultOwner.toLowerCase() === wallet.address.toLowerCase()
    console.log('  vault.owner == deployer:', match, match ? '' : `(owner is ${vaultOwner})`)
  } catch (e) { console.log('  vault.owner check skipped:', e.message) }

  const compA = artifact('RWAkinsCompliance')
  const credA = artifact('RWAkinsCreditPassport')
  const lendA = artifact('RWAkinsLending')
  console.log('  artifacts: compliance/credit/lending loaded ✓')

  if (bal === 0n) throw new Error('Deployer has 0 MNT — fund it at https://faucet.sepolia.mantle.xyz')

  if (CHECK) {
    console.log('\n✓ Preflight OK. Re-run WITHOUT --check to broadcast the deployment.')
    return
  }

  console.log('\n— Broadcasting —')
  const compliance = await new ethers.ContractFactory(compA.abi, compA.bin, wallet).deploy(wallet.address, wallet.address)
  await compliance.waitForDeployment()
  const complianceAddr = await compliance.getAddress()
  console.log('  RWAkinsCompliance     :', complianceAddr)

  const credit = await new ethers.ContractFactory(credA.abi, credA.bin, wallet).deploy(wallet.address)
  await credit.waitForDeployment()
  const creditAddr = await credit.getAddress()
  console.log('  RWAkinsCreditPassport :', creditAddr)

  const lending = await new ethers.ContractFactory(lendA.abi, lendA.bin, wallet).deploy(
    deployed.usdy, deployed.meth, deployed.amm, complianceAddr, creditAddr, wallet.address,
  )
  await lending.waitForDeployment()
  const lendingAddr = await lending.getAddress()
  console.log('  RWAkinsLending        :', lendingAddr)

  // KYC-attest the deployer (tier 2 = accredited, USA) so the lending demo is live.
  const attestTx = await compliance.attestKYC(wallet.address, 2, ethers.encodeBytes32String('USA'), 0)
  await attestTx.wait()
  console.log('  attestKYC(deployer, 2, USA) ✓')

  // Seed the lending USDY reserve (existing USDY MockRWAToken has an open mint).
  const usdy = new ethers.Contract(deployed.usdy, ['function mint(address,uint256)'], wallet)
  const seedTx = await usdy.mint(lendingAddr, ethers.parseEther('250000'))
  await seedTx.wait()
  console.log('  seeded 250,000 USDY into the lending reserve ✓')

  // Merge new addresses into the frontend deployment file (keep existing keys).
  deployed.compliance = complianceAddr
  deployed.creditPassport = creditAddr
  deployed.lending = lendingAddr
  deployed.deployedAt = Math.floor(Date.now() / 1000)
  writeFileSync(DEPLOYED_JSON, JSON.stringify(deployed, Object.keys(deployed).sort(), 2) + '\n')
  console.log('\n✓ Wrote addresses to lib/rwa-deployed.json. Rebuild/redeploy the frontend to go Live.')
  console.log('  Explorer:')
  for (const [k, a] of [['compliance', complianceAddr], ['creditPassport', creditAddr], ['lending', lendingAddr]]) {
    console.log(`    ${k.padEnd(14)} https://sepolia.mantlescan.xyz/address/${a}`)
  }
}

main().catch((e) => { console.error('\n✗ Deploy failed:', e.message); process.exit(1) })
