// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title KubryxRWAVault
/// @notice The hero contract of the Kubryx "AI x RWA" treasury on Mantle Sepolia.
///         Users deposit two RWA assets — USDY (stable yield) and mETH (ETH staking
///         yield) — and set a target allocation between them. An off-chain AI agent
///         *proposes* the allocation, but every risk rule is enforced *on-chain here*:
///         the contract, not the UI and not the AI, is the source of truth.
/// @dev    The two invariants in {rebalance} are what make an AI-driven treasury safe.
contract KubryxRWAVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice USDY mock token — the stable RWA yield asset.
    address public immutable usdy;
    /// @notice mETH mock token — ETH staking yield, treated as the higher-risk asset.
    address public immutable meth;

    /// @dev Denominator for allocation basis points (100% = 10_000 bps).
    uint256 public constant TOTAL_BPS = 10_000;

    /// @notice RISK GUARDRAIL — the maximum share (bps) allocatable to mETH, the
    ///         volatile asset. 7000 = 70%. Enforced in {rebalance}; no AI
    ///         recommendation can push the treasury past this hard cap.
    uint256 public constant MAX_RISK_BPS = 7_000;

    mapping(address => uint256) public usdyBalance;
    mapping(address => uint256) public methBalance;
    mapping(address => uint256) public usdyTargetBps;
    mapping(address => uint256) public methTargetBps;

    error UnknownAsset();
    error ZeroAmount();
    error InsufficientBalance();
    error InvalidAllocation(); // target bps do not sum to 100%
    error RiskLimitExceeded(); // mETH target above MAX_RISK_BPS

    event Deposited(address indexed user, address asset, uint256 amount);
    event Withdrawn(address indexed user, address asset, uint256 amount);
    event Rebalanced(address indexed user, uint256 usdyBps, uint256 methBps, uint256 timestamp);

    constructor(address _usdy, address _meth) {
        if (_usdy == address(0) || _meth == address(0)) revert UnknownAsset();
        usdy = _usdy;
        meth = _meth;
    }

    /// @notice Deposit `amount` of `asset` (must be USDY or mETH) into the vault.
    /// @dev    Pulls tokens via SafeERC20; caller must have approved this vault first.
    function deposit(address asset, uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (asset != usdy && asset != meth) revert UnknownAsset();

        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);

        if (asset == usdy) usdyBalance[msg.sender] += amount;
        else methBalance[msg.sender] += amount;

        emit Deposited(msg.sender, asset, amount);
    }

    /// @notice Withdraw `amount` of `asset` from the vault back to the caller.
    function withdraw(address asset, uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (asset != usdy && asset != meth) revert UnknownAsset();

        if (asset == usdy) {
            if (usdyBalance[msg.sender] < amount) revert InsufficientBalance();
            usdyBalance[msg.sender] -= amount;
        } else {
            if (methBalance[msg.sender] < amount) revert InsufficientBalance();
            methBalance[msg.sender] -= amount;
        }

        IERC20(asset).safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, asset, amount);
    }

    /// @notice Set the caller's target allocation between USDY and mETH.
    /// @param usdyBps target USDY share in basis points.
    /// @param methBps target mETH share in basis points.
    /// @dev Two on-chain invariants make the AI's proposal safe:
    ///      1. `usdyBps + methBps == TOTAL_BPS` — allocation must be fully specified (100%).
    ///      2. `methBps <= MAX_RISK_BPS` — the risk asset can never exceed the hard cap.
    ///      Any AI recommendation violating these reverts on-chain — the guardrail
    ///      lives in Solidity, deliberately not in the front-end.
    function rebalance(uint256 usdyBps, uint256 methBps) external {
        if (usdyBps + methBps != TOTAL_BPS) revert InvalidAllocation();
        if (methBps > MAX_RISK_BPS) revert RiskLimitExceeded();

        usdyTargetBps[msg.sender] = usdyBps;
        methTargetBps[msg.sender] = methBps;

        emit Rebalanced(msg.sender, usdyBps, methBps, block.timestamp);
    }

    /// @notice Read a user's full vault position in a single call (for the treasury UI).
    function getPortfolio(address user)
        external
        view
        returns (uint256 usdyBal, uint256 methBal, uint256 usdyBps, uint256 methBps)
    {
        return (
            usdyBalance[user],
            methBalance[user],
            usdyTargetBps[user],
            methTargetBps[user]
        );
    }

    /// @notice Nominal total deposited (USDY + mETH token units, both 18 decimals).
    /// @dev Demo metric — treats the two assets 1:1 in token units; it is not an
    ///      oracle-priced USD value.
    function getTotalValue(address user) external view returns (uint256) {
        return usdyBalance[user] + methBalance[user];
    }
}
