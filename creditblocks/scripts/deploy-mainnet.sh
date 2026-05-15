#!/bin/bash

# QIE Mainnet Deployment Script
# This script helps deploy NeuroCred contracts to QIE Mainnet

set -e  # Exit on error

echo "🚀 NeuroCred QIE Mainnet Deployment"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "contracts" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

# Step 1: Check environment variables
echo "📋 Step 1: Checking environment configuration..."
echo ""

if [ -z "$QIE_NETWORK" ]; then
    echo -e "${YELLOW}⚠️  QIE_NETWORK not set. Setting to 'mainnet'...${NC}"
    export QIE_NETWORK=mainnet
fi

if [ "$QIE_NETWORK" != "mainnet" ]; then
    echo -e "${RED}❌ Error: QIE_NETWORK must be set to 'mainnet' for mainnet deployment${NC}"
    echo "   Current value: $QIE_NETWORK"
    exit 1
fi

if [ ! -f "contracts/.env" ]; then
    echo -e "${YELLOW}⚠️  contracts/.env not found. Creating from example...${NC}"
    if [ -f "contracts/.env.example" ]; then
        cp contracts/.env.example contracts/.env
        echo -e "${YELLOW}   Please update contracts/.env with your configuration${NC}"
        exit 1
    else
        echo -e "${RED}❌ Error: contracts/.env not found and no .env.example available${NC}"
        exit 1
    fi
fi

# Check for required variables in contracts/.env
if ! grep -q "PRIVATE_KEY=" contracts/.env || grep -q "PRIVATE_KEY=$" contracts/.env; then
    echo -e "${RED}❌ Error: PRIVATE_KEY not set in contracts/.env${NC}"
    exit 1
fi

if ! grep -q "BACKEND_ADDRESS=" contracts/.env || grep -q "BACKEND_ADDRESS=$" contracts/.env; then
    echo -e "${YELLOW}⚠️  Warning: BACKEND_ADDRESS not set in contracts/.env${NC}"
    echo "   Role grants will need to be done manually"
fi

echo -e "${GREEN}✅ Environment configuration looks good${NC}"
echo ""

# Step 2: Confirm deployment
echo "⚠️  MAINNET DEPLOYMENT CONFIRMATION"
echo "===================================="
echo ""
echo "You are about to deploy to QIE MAINNET (Chain ID: 1990)"
echo "This will use REAL FUNDS (QIEV3)"
echo ""
echo "Press Ctrl+C to cancel, or"
read -p "Type 'DEPLOY TO MAINNET' to confirm: " confirmation

if [ "$confirmation" != "DEPLOY TO MAINNET" ]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Confirmation received${NC}"
echo ""

# Step 3: Deploy contracts
echo "📝 Step 2: Deploying contracts..."
echo ""

cd contracts

# Run deployment script
npx hardhat run scripts/deploy-mainnet.ts --network qieMainnet

DEPLOYMENT_EXIT_CODE=$?

cd ..

if [ $DEPLOYMENT_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed with exit code $DEPLOYMENT_EXIT_CODE${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Contracts deployed successfully${NC}"
echo ""

# Step 4: Extract addresses from .env.mainnet
if [ -f "contracts/.env.mainnet" ]; then
    echo "📋 Step 3: Extracting contract addresses..."
    echo ""
    
    CREDIT_PASSPORT_NFT_ADDRESS=$(grep "CREDIT_PASSPORT_NFT_ADDRESS=" contracts/.env.mainnet | cut -d '=' -f2)
    LENDING_VAULT_ADDRESS=$(grep "LENDING_VAULT_ADDRESS=" contracts/.env.mainnet | cut -d '=' -f2)
    STAKING_CONTRACT_ADDRESS=$(grep "STAKING_CONTRACT_ADDRESS=" contracts/.env.mainnet | cut -d '=' -f2)
    
    if [ -n "$CREDIT_PASSPORT_NFT_ADDRESS" ]; then
        echo "   CreditPassportNFT: $CREDIT_PASSPORT_NFT_ADDRESS"
    fi
    if [ -n "$LENDING_VAULT_ADDRESS" ]; then
        echo "   LendingVault:      $LENDING_VAULT_ADDRESS"
    fi
    if [ -n "$STAKING_CONTRACT_ADDRESS" ]; then
        echo "   NeuroCredStaking:  $STAKING_CONTRACT_ADDRESS"
    fi
    
    echo ""
    echo -e "${YELLOW}⚠️  Next Steps:${NC}"
    echo "   1. Update backend/.env with contract addresses"
    echo "   2. Update frontend/.env.local with contract addresses"
    echo "   3. Verify contracts: ./scripts/verify-mainnet.sh"
    echo ""
else
    echo -e "${YELLOW}⚠️  contracts/.env.mainnet not found${NC}"
    echo "   Contract addresses were not saved automatically"
    echo "   Please update environment files manually"
    echo ""
fi

echo -e "${GREEN}✅ Deployment script completed${NC}"
echo ""
echo "📝 View contracts on explorer:"
echo "   https://mainnet.qie.digital/"

