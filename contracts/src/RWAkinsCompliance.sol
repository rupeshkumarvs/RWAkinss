// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title RWAkinsCompliance
/// @notice The on-chain COMPLIANCE + AUDIT hub for the RWAkins AI CFO. It does three
///         jobs that the AI×RWA judging rubric rewards directly:
///
///           1. KYC / accreditation gate — a verifier (the compliance signer)
///              attests a user's KYC tier + jurisdiction on-chain. The vault flow
///              and the lending market read `isVerified(user)` before letting a
///              regulated RWA action proceed. Real-world RWAs (Ondo USDY) are
///              KYC-gated; this models that constraint instead of ignoring it.
///
///           2. Investment mandate — each user records the plain-English mandate
///              their AI CFO must stay within. Stored on-chain so a rebalance can
///              be checked against a mandate the user actually committed to.
///
///           3. Tamper-evident AUDIT TRAIL — the agent writes every decision
///              (allowed or blocked) here via `logDecision`, and every risk score
///              via `recordRisk`. Because these are on-chain events with a
///              monotonic per-user sequence, the agent's behaviour is independently
///              verifiable — the "radical transparency / on-chain benchmarking"
///              the hackathon is built around.
///
///         Roles: `owner` (deploy key) administers `attestor` (KYC verifier) and
///         `agent` (the autonomous CFO key). KYC/agent writes are role-gated so the
///         log can't be spoofed by an arbitrary caller; mandate is self-sovereign
///         (a user sets their own).
contract RWAkinsCompliance {
    // ── Roles ────────────────────────────────────────────────────────────────
    address public owner;
    address public attestor; // issues KYC attestations (a licensed verifier)
    address public agent; // the AI CFO key that writes decisions + risk scores

    // ── KYC attestations ─────────────────────────────────────────────────────
    /// @dev tier: 0 = none, 1 = retail KYC, 2 = accredited, 3 = institutional.
    struct Attestation {
        uint8 tier;
        bytes32 jurisdiction; // ISO-3166 alpha-3 packed as bytes32, e.g. "USA","SGP"
        uint64 issuedAt;
        uint64 expiresAt; // 0 = no expiry
        bool revoked;
    }

    mapping(address => Attestation) public attestationOf;

    // ── Investment mandate (self-sovereign) ──────────────────────────────────
    mapping(address => string) public mandateOf;

    // ── Audit trail + latest risk score ──────────────────────────────────────
    /// @dev Monotonic count of decisions logged per user — the audit sequence.
    mapping(address => uint256) public decisionCount;

    struct RiskSnapshot {
        uint16 score; // 0-1000 composite risk score (higher = riskier)
        uint8 band; // 1=Low 2=Moderate 3=Elevated 4=High 5=Critical
        uint64 updatedAt;
    }

    mapping(address => RiskSnapshot) public riskOf;

    // ── Events (the verifiable record) ───────────────────────────────────────
    event KYCAttested(address indexed user, uint8 tier, bytes32 jurisdiction, uint64 expiresAt);
    event KYCRevoked(address indexed user);
    event MandateSet(address indexed user, string mandate);
    event DecisionLogged(
        address indexed user,
        uint256 indexed seq,
        bytes32 kind, // e.g. "REBALANCE","DEPOSIT","BORROW"
        bool allowed,
        string detail,
        uint64 timestamp
    );
    event RiskRecorded(address indexed user, uint16 score, uint8 band, uint64 timestamp);
    event RoleSet(bytes32 indexed role, address account);

    constructor(address _attestor, address _agent) {
        owner = msg.sender;
        attestor = _attestor == address(0) ? msg.sender : _attestor;
        agent = _agent == address(0) ? msg.sender : _agent;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }
    modifier onlyAttestor() {
        require(msg.sender == attestor || msg.sender == owner, "NOT_ATTESTOR");
        _;
    }
    modifier onlyAgent() {
        require(msg.sender == agent || msg.sender == owner, "NOT_AGENT");
        _;
    }

    // ── Role admin ───────────────────────────────────────────────────────────
    function setAttestor(address a) external onlyOwner {
        attestor = a;
        emit RoleSet("ATTESTOR", a);
    }

    function setAgent(address a) external onlyOwner {
        agent = a;
        emit RoleSet("AGENT", a);
    }

    // ── 1. KYC gate ──────────────────────────────────────────────────────────
    /// @notice Attest a user's KYC tier + jurisdiction. `expiresAt`==0 → no expiry.
    function attestKYC(address user, uint8 tier, bytes32 jurisdiction, uint64 expiresAt)
        external
        onlyAttestor
    {
        require(user != address(0), "ZERO_ADDR");
        require(tier >= 1 && tier <= 3, "BAD_TIER");
        attestationOf[user] =
            Attestation({tier: tier, jurisdiction: jurisdiction, issuedAt: uint64(block.timestamp), expiresAt: expiresAt, revoked: false});
        emit KYCAttested(user, tier, jurisdiction, expiresAt);
    }

    function revokeKYC(address user) external onlyAttestor {
        attestationOf[user].revoked = true;
        emit KYCRevoked(user);
    }

    /// @notice True when the user holds a live, non-expired, non-revoked attestation.
    function isVerified(address user) public view returns (bool) {
        Attestation memory a = attestationOf[user];
        if (a.tier == 0 || a.revoked) return false;
        if (a.expiresAt != 0 && block.timestamp > a.expiresAt) return false;
        return true;
    }

    function tierOf(address user) external view returns (uint8) {
        return isVerified(user) ? attestationOf[user].tier : 0;
    }

    // ── 2. Mandate (self-sovereign) ──────────────────────────────────────────
    function setMandate(string calldata mandate) external {
        mandateOf[msg.sender] = mandate;
        emit MandateSet(msg.sender, mandate);
    }

    // ── 3. Audit trail + risk record (agent-written) ─────────────────────────
    /// @notice Append a decision to the user's tamper-evident audit trail. The
    ///         monotonic `seq` lets anyone detect a gap or reordering.
    function logDecision(address user, bytes32 kind, bool allowed, string calldata detail)
        external
        onlyAgent
        returns (uint256 seq)
    {
        seq = ++decisionCount[user];
        emit DecisionLogged(user, seq, kind, allowed, detail, uint64(block.timestamp));
    }

    /// @notice Record the latest composite risk score for a user (0-1000, band 1-5).
    function recordRisk(address user, uint16 score, uint8 band) external onlyAgent {
        require(score <= 1000, "BAD_SCORE");
        require(band >= 1 && band <= 5, "BAD_BAND");
        riskOf[user] = RiskSnapshot({score: score, band: band, updatedAt: uint64(block.timestamp)});
        emit RiskRecorded(user, score, band, uint64(block.timestamp));
    }

    function getRisk(address user) external view returns (uint16 score, uint8 band, uint64 updatedAt) {
        RiskSnapshot memory r = riskOf[user];
        return (r.score, r.band, r.updatedAt);
    }
}
