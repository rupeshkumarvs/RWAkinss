import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { resolve } from "path";
import * as fs from "fs";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env") });

interface ValidationResult {
  passed: boolean;
  message: string;
  details?: any;
}

interface DryRunResult {
  step: string;
  status: "✅ PASS" | "❌ FAIL" | "⚠️  WARN";
  message: string;
  details?: any;
}

async function main() {
  console.log("🔍 CreditBlocks Mainnet Deployment Dry-Run");
  console.log("=" .repeat(60));
  console.log("This script validates deployment readiness WITHOUT deploying.\n");

  const results: DryRunResult[] = [];

  // ========== STEP 1: Network Validation ==========
  console.log("📡 [1/7] Validating Network Configuration...");
  try {
    const network = await ethers.provider.getNetwork();
    
    if (network.chainId !== 1990n) {
      results.push({
        step: "Network Chain ID",
        status: "❌ FAIL",
        message: `Wrong network! Expected 1990 (QIE Mainnet), got ${network.chainId}`,
        details: { expected: 1990, actual: network.chainId.toString() }
      });
    } else {
      results.push({
        step: "Network Chain ID",
        status: "✅ PASS",
        message: `Connected to QIE Mainnet (Chain ID: ${network.chainId})`,
        details: { chainId: network.chainId.toString() }
      });
    }

    // Test RPC connectivity
    try {
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      results.push({
        step: "RPC Connectivity",
        status: "✅ PASS",
        message: `RPC is responsive. Latest block: ${blockNumber}`,
        details: { blockNumber, timestamp: new Date(Number(block.timestamp) * 1000).toISOString() }
      });
    } catch (error: any) {
      results.push({
        step: "RPC Connectivity",
        status: "❌ FAIL",
        message: `RPC connection failed: ${error.message}`,
        details: { error: error.message }
      });
    }

    // Test gas price retrieval
    try {
      const feeData = await ethers.provider.getFeeData();
      if (feeData.gasPrice) {
        const gasPriceGwei = Number(ethers.formatUnits(feeData.gasPrice, "gwei"));
        results.push({
          step: "Gas Price",
          status: "✅ PASS",
          message: `Gas price: ${gasPriceGwei.toFixed(2)} Gwei`,
          details: { gasPriceGwei }
        });
      } else {
        results.push({
          step: "Gas Price",
          status: "⚠️  WARN",
          message: "Could not retrieve gas price",
        });
      }
    } catch (error: any) {
      results.push({
        step: "Gas Price",
        status: "⚠️  WARN",
        message: `Gas price check failed: ${error.message}`,
      });
    }
  } catch (error: any) {
    results.push({
      step: "Network Validation",
      status: "❌ FAIL",
      message: `Network validation failed: ${error.message}`,
    });
  }

  // ========== STEP 2: Environment Variables ==========
  console.log("\n🔐 [2/7] Validating Environment Variables...");
  
  const requiredEnvVars = [
    { key: "PRIVATE_KEY", description: "Deployer private key" },
    { key: "QIE_MAINNET_RPC_URL", description: "QIE Mainnet RPC URL", optional: true },
    { key: "QIE_MAINNET_CHAIN_ID", description: "QIE Mainnet Chain ID", optional: true },
  ];

  const optionalEnvVars = [
    { key: "NCRD_TOKEN_ADDRESS", description: "NCRD Token address (for staking)" },
    { key: "BACKEND_ADDRESS", description: "Backend wallet address (for role grant)" },
    { key: "AI_SIGNER_ADDRESS", description: "AI signer address (for LendingVault)" },
    { key: "LOAN_TOKEN_ADDRESS", description: "Loan token address (0x0 for native QIE)" },
  ];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.key];
    if (!value && !envVar.optional) {
      results.push({
        step: `Env: ${envVar.key}`,
        status: "❌ FAIL",
        message: `Missing required environment variable: ${envVar.key}`,
        details: { description: envVar.description }
      });
    } else if (value) {
      // Validate private key format
      if (envVar.key === "PRIVATE_KEY") {
        if (!value.startsWith("0x") || value.length !== 66) {
          results.push({
            step: `Env: ${envVar.key}`,
            status: "❌ FAIL",
            message: `Invalid private key format (should be 0x + 64 hex chars)`,
          });
        } else {
          results.push({
            step: `Env: ${envVar.key}`,
            status: "✅ PASS",
            message: `Private key format valid (masked: ${value.slice(0, 6)}...${value.slice(-4)})`,
          });
        }
      } else {
        results.push({
          step: `Env: ${envVar.key}`,
          status: "✅ PASS",
          message: `${envVar.description} is set`,
          details: { value: envVar.key.includes("KEY") ? "***" : value }
        });
      }
    }
  }

  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar.key];
    if (value) {
      // Validate address format
      if (envVar.key.includes("ADDRESS")) {
        if (ethers.isAddress(value)) {
          results.push({
            step: `Env: ${envVar.key}`,
            status: "✅ PASS",
            message: `${envVar.description} is set and valid`,
            details: { address: value }
          });
        } else {
          results.push({
            step: `Env: ${envVar.key}`,
            status: "❌ FAIL",
            message: `Invalid address format: ${value}`,
          });
        }
      } else {
        results.push({
          step: `Env: ${envVar.key}`,
          status: "✅ PASS",
          message: `${envVar.description} is set`,
        });
      }
    } else {
      results.push({
        step: `Env: ${envVar.key}`,
        status: "⚠️  WARN",
        message: `${envVar.description} not set (optional)`,
      });
    }
  }

  // ========== STEP 3: Deployer Account ==========
  console.log("\n👤 [3/7] Validating Deployer Account...");
  try {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceEth = ethers.formatEther(balance);
    const balanceNum = parseFloat(balanceEth);

    results.push({
      step: "Deployer Address",
      status: "✅ PASS",
      message: `Deployer: ${deployer.address}`,
      details: { address: deployer.address }
    });

    results.push({
      step: "Deployer Balance",
      status: balanceNum >= 1.0 ? "✅ PASS" : balanceNum >= 0.1 ? "⚠️  WARN" : "❌ FAIL",
      message: `Balance: ${balanceEth} QIEV3`,
      details: { 
        balance: balanceEth,
        recommended: "At least 1.0 QIEV3 for safe deployment"
      }
    });

    // Estimate deployment cost
    const estimatedGas = {
      CreditPassportNFT: 1750000,
      NeuroCredStaking: 2000000,
      LendingVault: 2250000,
      GrantRole: 50000
    };

    let totalGas = estimatedGas.CreditPassportNFT + estimatedGas.LendingVault;
    const willDeployStaking = process.env.NCRD_TOKEN_ADDRESS && 
                              process.env.NCRD_TOKEN_ADDRESS !== "0x0000000000000000000000000000000000000000";
    if (willDeployStaking) {
      totalGas += estimatedGas.NeuroCredStaking;
    }

    const willGrantRole = process.env.BACKEND_ADDRESS && ethers.isAddress(process.env.BACKEND_ADDRESS);
    if (willGrantRole) {
      totalGas += estimatedGas.GrantRole;
    }

    const feeData = await ethers.provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits("1", "gwei");
    const estimatedCost = (BigInt(totalGas) * gasPrice) / ethers.parseEther("1");
    const estimatedCostFormatted = ethers.formatEther(estimatedCost);

    results.push({
      step: "Estimated Deployment Cost",
      status: parseFloat(estimatedCostFormatted) < balanceNum * 0.5 ? "✅ PASS" : "⚠️  WARN",
      message: `Estimated: ~${estimatedCostFormatted} QIEV3 (${totalGas.toLocaleString()} gas)`,
      details: {
        estimatedCost: estimatedCostFormatted,
        totalGas,
        balance: balanceEth,
        willDeployStaking,
        willGrantRole
      }
    });
  } catch (error: any) {
    results.push({
      step: "Deployer Account",
      status: "❌ FAIL",
      message: `Failed to validate deployer: ${error.message}`,
    });
  }

  // ========== STEP 4: Contract Compilation ==========
  console.log("\n📦 [4/7] Validating Contract Compilation...");
  try {
    const contracts = [
      "CreditPassportNFT",
      "LendingVault",
      "NeuroCredStaking"
    ];

    for (const contractName of contracts) {
      try {
        const factory = await ethers.getContractFactory(contractName);
        const bytecode = factory.bytecode;
        
        if (bytecode && bytecode.length > 0) {
          results.push({
            step: `Contract: ${contractName}`,
            status: "✅ PASS",
            message: `Contract compiled successfully`,
            details: { bytecodeLength: bytecode.length }
          });
        } else {
          results.push({
            step: `Contract: ${contractName}`,
            status: "❌ FAIL",
            message: `Contract bytecode is empty`,
          });
        }
      } catch (error: any) {
        results.push({
          step: `Contract: ${contractName}`,
          status: "❌ FAIL",
          message: `Compilation failed: ${error.message}`,
        });
      }
    }
  } catch (error: any) {
    results.push({
      step: "Contract Compilation",
      status: "❌ FAIL",
      message: `Compilation check failed: ${error.message}`,
    });
  }

  // ========== STEP 5: Simulate Deployment ==========
  console.log("\n🎭 [5/7] Simulating Deployment (No Transactions Sent)...");
  try {
    const [deployer] = await ethers.getSigners();

    // Simulate CreditPassportNFT deployment
    try {
      const CreditPassportNFT = await ethers.getContractFactory("CreditPassportNFT");
      const deployTx = await CreditPassportNFT.getDeployTransaction(deployer.address);
      const estimatedGas = await ethers.provider.estimateGas(deployTx);
      
      results.push({
        step: "Simulate: CreditPassportNFT",
        status: "✅ PASS",
        message: `Deployment simulation successful`,
        details: { estimatedGas: estimatedGas.toString() }
      });
    } catch (error: any) {
      results.push({
        step: "Simulate: CreditPassportNFT",
        status: "❌ FAIL",
        message: `Deployment simulation failed: ${error.message}`,
      });
    }

    // Simulate LendingVault deployment (needs passport address)
    try {
      // Use a dummy address for simulation
      const dummyPassport = "0x1111111111111111111111111111111111111111";
      const dummyLoanToken = process.env.LOAN_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";
      const dummyAISigner = process.env.AI_SIGNER_ADDRESS || process.env.BACKEND_ADDRESS || deployer.address;
      
      const LendingVault = await ethers.getContractFactory("LendingVault");
      const deployTx = await LendingVault.getDeployTransaction(
        dummyPassport,
        dummyLoanToken,
        dummyAISigner,
        deployer.address
      );
      const estimatedGas = await ethers.provider.estimateGas(deployTx);
      
      results.push({
        step: "Simulate: LendingVault",
        status: "✅ PASS",
        message: `Deployment simulation successful`,
        details: { estimatedGas: estimatedGas.toString() }
      });
    } catch (error: any) {
      results.push({
        step: "Simulate: LendingVault",
        status: "❌ FAIL",
        message: `Deployment simulation failed: ${error.message}`,
      });
    }

    // Simulate NeuroCredStaking if token address is set
    if (process.env.NCRD_TOKEN_ADDRESS && 
        process.env.NCRD_TOKEN_ADDRESS !== "0x0000000000000000000000000000000000000000") {
      try {
        const NeuroCredStaking = await ethers.getContractFactory("NeuroCredStaking");
        const deployTx = await NeuroCredStaking.getDeployTransaction(
          process.env.NCRD_TOKEN_ADDRESS,
          deployer.address
        );
        const estimatedGas = await ethers.provider.estimateGas(deployTx);
        
        results.push({
          step: "Simulate: NeuroCredStaking",
          status: "✅ PASS",
          message: `Deployment simulation successful`,
          details: { estimatedGas: estimatedGas.toString() }
        });
      } catch (error: any) {
        results.push({
          step: "Simulate: NeuroCredStaking",
          status: "❌ FAIL",
          message: `Deployment simulation failed: ${error.message}`,
        });
      }
    }
  } catch (error: any) {
    results.push({
      step: "Deployment Simulation",
      status: "❌ FAIL",
      message: `Simulation failed: ${error.message}`,
    });
  }

  // ========== STEP 6: Testnet Dependency Check ==========
  console.log("\n🔍 [6/7] Checking for Testnet Dependencies...");
  
  // Check hardhat config
  try {
    const configPath = resolve(__dirname, "../hardhat.config.ts");
    const configContent = fs.readFileSync(configPath, "utf-8");
    
    const testnetPatterns = [
      { pattern: /1983/g, name: "Testnet Chain ID (1983)" },
      { pattern: /rpc1testnet\.qie\.digital/g, name: "Testnet RPC URL" },
      { pattern: /testnet\.qie\.digital/g, name: "Testnet Explorer URL" },
    ];

    for (const check of testnetPatterns) {
      const matches = configContent.match(check.pattern);
      if (matches && matches.length > 0) {
        // Check if it's in a comment or testnet-specific section
        const lines = configContent.split("\n");
        let isInTestnetSection = false;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(check.pattern.source.replace(/\\/g, ""))) {
            // Check if it's in qieTestnet network config (which is OK)
            const beforeLine = lines.slice(Math.max(0, i - 5), i).join("\n");
            if (beforeLine.includes("qieTestnet") || beforeLine.includes("//")) {
              isInTestnetSection = true;
              break;
            }
          }
        }
        
        if (!isInTestnetSection) {
          results.push({
            step: `Testnet Check: ${check.name}`,
            status: "⚠️  WARN",
            message: `Found ${check.name} in hardhat.config.ts (may be in testnet section, verify)`,
          });
        } else {
          results.push({
            step: `Testnet Check: ${check.name}`,
            status: "✅ PASS",
            message: `${check.name} found only in testnet section (OK)`,
          });
        }
      } else {
        results.push({
          step: `Testnet Check: ${check.name}`,
          status: "✅ PASS",
          message: `No ${check.name} found in mainnet config`,
        });
      }
    }
  } catch (error: any) {
    results.push({
      step: "Testnet Dependency Check",
      status: "⚠️  WARN",
      message: `Could not check config file: ${error.message}`,
    });
  }

  // Check environment variables for testnet values
  const testnetEnvVars = [
    { key: "QIE_TESTNET_RPC_URL", name: "Testnet RPC URL" },
    { key: "QIE_TESTNET_CHAIN_ID", name: "Testnet Chain ID" },
  ];

  for (const envVar of testnetEnvVars) {
    const value = process.env[envVar.key];
    if (value && value.includes("testnet")) {
      results.push({
        step: `Env Check: ${envVar.name}`,
        status: "⚠️  WARN",
        message: `Testnet env var ${envVar.key} is set (should not affect mainnet deployment)`,
      });
    } else {
      results.push({
        step: `Env Check: ${envVar.name}`,
        status: "✅ PASS",
        message: `No testnet values in mainnet deployment`,
      });
    }
  }

  // ========== STEP 7: Deployment Readiness Summary ==========
  console.log("\n📋 [7/7] Generating Deployment Readiness Summary...");

  const passed = results.filter(r => r.status === "✅ PASS").length;
  const failed = results.filter(r => r.status === "❌ FAIL").length;
  const warnings = results.filter(r => r.status === "⚠️  WARN").length;

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 DRY-RUN SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log("");

  // Print all results
  for (const result of results) {
    console.log(`${result.status} ${result.step}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2).split("\n").join("\n   ")}`);
    }
    console.log("");
  }

  // Final verdict
  console.log("=".repeat(60));
  if (failed === 0) {
    if (warnings === 0) {
      console.log("✅ ALL CHECKS PASSED - Ready for mainnet deployment!");
      console.log("   You can proceed with: npx hardhat run scripts/deploy-mainnet.ts --network qieMainnet");
    } else {
      console.log("⚠️  READY WITH WARNINGS - Review warnings before deploying");
      console.log("   Some optional configurations are missing but deployment can proceed");
    }
  } else {
    console.log("❌ DEPLOYMENT NOT READY - Fix failures before deploying");
    console.log("   Please address all failed checks above");
  }
  console.log("=".repeat(60));

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Dry-run failed with error:", error);
    process.exit(1);
  });

