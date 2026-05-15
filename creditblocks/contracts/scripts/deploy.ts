import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting CreditBlocks deployment...\n");

  // Check network
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceEth = ethers.formatEther(balance);

  console.log("👤 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", balanceEth, "QIE");

  // Check if balance is sufficient
  if (parseFloat(balanceEth) < 0.01) {
    console.warn("⚠️  Warning: Low balance! You may need more QIE for gas fees.");
    console.log("   Get testnet tokens from: https://qie.digital/faucet");
  }

  try {
    // Deploy CreditPassportNFT
    console.log("\n📝 Deploying CreditPassportNFT...");
    const CreditPassportNFT = await ethers.getContractFactory("CreditPassportNFT");
    const passportNFT = await CreditPassportNFT.deploy(deployer.address);
    
    console.log("   Waiting for deployment confirmation...");
    await passportNFT.waitForDeployment();

    const passportAddress = await passportNFT.getAddress();
    console.log("✅ CreditPassportNFT deployed to:", passportAddress);

    // Verify contract was deployed correctly
    const name = await passportNFT.name();
    const symbol = await passportNFT.symbol();
    console.log(`   Verified: ${name} (${symbol})`);

    // Get backend wallet address from env (or use deployer for now)
    const backendWalletAddress = process.env.BACKEND_WALLET_ADDRESS || deployer.address;
    
    if (backendWalletAddress !== deployer.address) {
      console.log("\n🔐 Setting up score updater role...");
      const tx = await passportNFT.setScoreUpdater(backendWalletAddress, true);
      console.log("   Transaction hash:", tx.hash);
      await tx.wait();
      console.log("✅ Score updater role granted to:", backendWalletAddress);
      
      // Verify role was granted
      const hasRole = await passportNFT.hasRole(
        await passportNFT.SCORE_UPDATER_ROLE(),
        backendWalletAddress
      );
      if (!hasRole) {
        throw new Error("Failed to verify score updater role");
      }
    } else {
      console.log("\n⚠️  Using deployer as score updater (set BACKEND_WALLET_ADDRESS in .env for production)");
      const tx = await passportNFT.setScoreUpdater(deployer.address, true);
      await tx.wait();
    }

    // Optional: Deploy staking contract if NCRD token address is provided
    let stakingAddress: string | undefined;
    if (process.env.NCRD_TOKEN_ADDRESS) {
      console.log("\n📝 Deploying NeuroCredStaking...");
      const ncrdAddress = process.env.NCRD_TOKEN_ADDRESS;
      
      // Validate NCRD address
      if (!ethers.isAddress(ncrdAddress)) {
        throw new Error(`Invalid NCRD_TOKEN_ADDRESS: ${ncrdAddress}`);
      }

      const NeuroCredStaking = await ethers.getContractFactory("NeuroCredStaking");
      const staking = await NeuroCredStaking.deploy(ncrdAddress, deployer.address);
      
      console.log("   Waiting for deployment confirmation...");
      await staking.waitForDeployment();
      stakingAddress = await staking.getAddress();
      console.log("✅ NeuroCredStaking deployed to:", stakingAddress);
    } else {
      console.log("\nℹ️  Skipping NeuroCredStaking (NCRD_TOKEN_ADDRESS not set)");
      console.log("   To deploy staking: Create NCRD token on QIEDex, then set NCRD_TOKEN_ADDRESS in .env");
    }

    // Deployment Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ DEPLOYMENT SUCCESSFUL");
    console.log("=".repeat(60));
    console.log("\n📋 Contract Addresses:");
    console.log(`   CreditPassportNFT: ${passportAddress}`);
    console.log(`   Backend Wallet:    ${backendWalletAddress}`);
    if (stakingAddress) {
      console.log(`   NeuroCredStaking:  ${stakingAddress}`);
    }
    
    console.log("\n📝 Next Steps:");
    console.log("   1. Add these addresses to backend/.env:");
    console.log(`      CREDIT_PASSPORT_NFT_ADDRESS=${passportAddress}`);
    console.log(`      BACKEND_PRIVATE_KEY=your_backend_private_key`);
    console.log("\n   2. Add to frontend/.env.local:");
    console.log(`      NEXT_PUBLIC_CONTRACT_ADDRESS=${passportAddress}`);
    console.log("\n   3. View on explorer:");
    const explorerUrl = network.chainId === 1337n 
      ? `https://testnet.qie.digital/address/${passportAddress}`
      : `https://mainnet.qie.digital/address/${passportAddress}`;
    console.log(`      ${explorerUrl}`);
    console.log("\n" + "=".repeat(60));

  } catch (error: any) {
    console.error("\n❌ Deployment failed!");
    console.error("Error:", error.message);
    if (error.transaction) {
      console.error("Transaction:", error.transaction);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

