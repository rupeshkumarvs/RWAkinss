import hre from "hardhat";
import { parseEther } from "viem";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { writeFileSync, mkdirSync } from "node:fs";

// Deploys the Kubryx AI x RWA stack to Mantle Sepolia:
//   - MockRWAToken  "Kubryx USDY (Testnet Mock)" / kUSDY / 4.80% APY
//   - MockRWAToken  "Kubryx mETH (Testnet Mock)" / kMETH / 3.60% APY
//   - KubryxRWAVault wired to both tokens
// Then seeds the deployer with 10,000 of each and approves the vault, and writes
// every address to hub/lib/rwa-deployed.json for the front-end to consume.
async function main() {
  const [deployer] = await hre.viem.getWalletClients();
  if (!deployer) {
    throw new Error(
      "No deployer account. Set DEPLOYER_PRIVATE_KEY in .env.local and fund it with MNT.",
    );
  }
  const deployerAddress = deployer.account.address;
  console.log(`Deployer: ${deployerAddress}`);

  // 1. Mock RWA tokens (yield in basis points)
  const usdy = await hre.viem.deployContract("MockRWAToken", [
    "Kubryx USDY (Testnet Mock)",
    "kUSDY",
    480n,
  ]);
  console.log(`kUSDY  deployed: ${usdy.address}`);

  const meth = await hre.viem.deployContract("MockRWAToken", [
    "Kubryx mETH (Testnet Mock)",
    "kMETH",
    360n,
  ]);
  console.log(`kMETH  deployed: ${meth.address}`);

  // 2. The hero vault
  const vault = await hre.viem.deployContract("KubryxRWAVault", [
    usdy.address,
    meth.address,
  ]);
  console.log(`Vault  deployed: ${vault.address}`);

  // 3. Seed the deployer wallet and pre-approve the vault for a friction-free demo
  const seed = parseEther("10000");
  await usdy.write.mint([deployerAddress, seed]);
  await meth.write.mint([deployerAddress, seed]);
  await usdy.write.approve([vault.address, seed]);
  await meth.write.approve([vault.address, seed]);
  console.log("Minted 10,000 kUSDY + 10,000 kMETH to deployer and approved the vault.");

  // 4. Publish addresses for the hub UI
  const out = {
    usdy: usdy.address,
    meth: meth.address,
    vault: vault.address,
    chainId: 5003,
    deployedAt: new Date().toISOString(),
    deployer: deployerAddress,
  };
  const here = dirname(fileURLToPath(import.meta.url)); // invoices/contracts/scripts
  const target = resolve(here, "../../../hub/lib/rwa-deployed.json");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nWrote addresses -> ${target}`);

  const base = "https://sepolia.mantlescan.xyz/address/";
  console.log("\nMantlescan:");
  console.log(`  kUSDY : ${base}${usdy.address}`);
  console.log(`  kMETH : ${base}${meth.address}`);
  console.log(`  Vault : ${base}${vault.address}`);
  console.log("\nVerify with:");
  console.log(
    `  npx hardhat verify --config contracts/hardhat.config.ts --network mantleSepolia ${vault.address} ${usdy.address} ${meth.address}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
