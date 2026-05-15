// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title INeuroCredScore
/// @notice Simple interface for querying CreditBlocks scores on QIE.
interface INeuroCredScore {
    /// @notice Risk band used for quick decisions by dApps
    /// 0 = Unknown / Unscored
    /// 1 = Low risk
    /// 2 = Medium risk
    /// 3 = High risk
    struct ScoreView {
        uint16 score;       // 0–1000
        uint8 riskBand;     // 0–3
        uint64 lastUpdated; // unix timestamp
    }

    /// @notice Returns latest score data for a given wallet.
    function getScore(address user) external view returns (ScoreView memory);
}

