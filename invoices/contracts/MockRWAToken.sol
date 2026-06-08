// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockRWAToken
/// @notice TESTNET MOCK — represents a real-world asset (USDY / mETH) for the
///         Kubryx "AI x RWA" demo on Mantle Sepolia. This is NOT a real RWA asset,
///         has no real-world backing, and `mint` is intentionally left open so the
///         demo wallet can fund itself from a faucet-style call. Do not use on mainnet.
contract MockRWAToken is ERC20 {
    /// @notice Annualised yield, in basis points (e.g. 480 = 4.80% APY).
    ///         Demo metadata only — read by the off-chain AI rebalancer to reason
    ///         about USDY (stable) vs mETH (staking) allocation.
    uint256 public immutable yieldRate;

    constructor(string memory name_, string memory symbol_, uint256 yieldRate_)
        ERC20(name_, symbol_)
    {
        yieldRate = yieldRate_;
    }

    /// @notice Open testnet mint — anyone can mint demo tokens. NOT for mainnet.
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /// @notice The mock annualised yield (basis points) used by the AI rebalancer.
    function currentYield() external view returns (uint256) {
        return yieldRate;
    }
}
