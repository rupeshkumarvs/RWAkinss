// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title RWAkinsCreditPassport
/// @notice A SOULBOUND (non-transferable) ERC-721 that carries a wallet's on-chain
///         credit score for the RWAkins economy. One passport per address; it can
///         never be sold, lent, or transferred — your reputation is yours alone.
///
///         The score (300-900, FICO-like) is computed off-chain by the AI credit
///         engine (/api/credit/score) from REAL on-chain signals — vault balance,
///         allocation discipline, rebalance history, KYC tier — then written here
///         by the scorer key. Because the passport is on-chain and soulbound, the
///         RWAkins lending market can trust it directly: a higher score unlocks a
///         higher borrow LTV (see RWAkinsLending), with no oracle to spoof.
///
///         Minimal, dependency-free ERC-721 (enough for wallets/explorers to render
///         the token) with all transfer paths reverting — the soulbound guarantee.
contract RWAkinsCreditPassport {
    string public constant name = "RWAkins Credit Passport";
    string public constant symbol = "RCRD";

    address public owner;
    address public scorer; // the AI credit engine key allowed to write scores

    struct Passport {
        uint16 score; // 300-900
        uint8 band; // 1=Poor 2=Fair 3=Good 4=VeryGood 5=Excellent
        uint64 updatedAt;
        uint256 tokenId;
        bool exists;
    }

    uint256 public totalSupply;
    mapping(address => Passport) public passportOf;
    mapping(uint256 => address) public ownerOfToken; // tokenId → holder

    event PassportMinted(address indexed holder, uint256 indexed tokenId);
    event ScoreUpdated(address indexed holder, uint16 score, uint8 band, uint64 timestamp);
    // ERC-721 Transfer emitted only on mint (from address(0)) — never on transfer.
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    error Soulbound();

    constructor(address _scorer) {
        owner = msg.sender;
        scorer = _scorer == address(0) ? msg.sender : _scorer;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }
    modifier onlyScorer() {
        require(msg.sender == scorer || msg.sender == owner, "NOT_SCORER");
        _;
    }

    function setScorer(address s) external onlyOwner {
        scorer = s;
    }

    // ── Mint (one soulbound passport per address) ────────────────────────────
    /// @notice Mint the caller their passport. Idempotent: re-minting is a no-op
    ///         that returns the existing tokenId, so the onboarding flow is safe.
    function mint() external returns (uint256) {
        return _mintTo(msg.sender);
    }

    /// @notice Mint a passport to `holder` (used by the scorer when issuing a score
    ///         to a wallet that has not minted yet).
    function mintTo(address holder) external onlyScorer returns (uint256) {
        return _mintTo(holder);
    }

    function _mintTo(address holder) internal returns (uint256) {
        require(holder != address(0), "ZERO_ADDR");
        Passport storage p = passportOf[holder];
        if (p.exists) return p.tokenId;
        uint256 tokenId = ++totalSupply;
        p.exists = true;
        p.tokenId = tokenId;
        p.updatedAt = uint64(block.timestamp);
        ownerOfToken[tokenId] = holder;
        emit Transfer(address(0), holder, tokenId);
        emit PassportMinted(holder, tokenId);
        return tokenId;
    }

    // ── Scoring (AI engine writes the result) ────────────────────────────────
    /// @notice Set a holder's credit score. Mints their passport first if needed,
    ///         so the engine can score any wallet in one call.
    function setScore(address holder, uint16 score, uint8 band) external onlyScorer {
        require(score >= 300 && score <= 900, "BAD_SCORE");
        require(band >= 1 && band <= 5, "BAD_BAND");
        _mintTo(holder);
        Passport storage p = passportOf[holder];
        p.score = score;
        p.band = band;
        p.updatedAt = uint64(block.timestamp);
        emit ScoreUpdated(holder, score, band, uint64(block.timestamp));
    }

    function scoreOf(address holder) external view returns (uint16) {
        return passportOf[holder].score;
    }

    function getPassport(address holder)
        external
        view
        returns (bool exists, uint16 score, uint8 band, uint64 updatedAt, uint256 tokenId)
    {
        Passport memory p = passportOf[holder];
        return (p.exists, p.score, p.band, p.updatedAt, p.tokenId);
    }

    // ── ERC-721 surface (read) ───────────────────────────────────────────────
    function balanceOf(address holder) external view returns (uint256) {
        return passportOf[holder].exists ? 1 : 0;
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address h = ownerOfToken[tokenId];
        require(h != address(0), "NO_TOKEN");
        return h;
    }

    /// @notice On-chain SVG-free data URI describing the passport (score + band).
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        address h = ownerOfToken[tokenId];
        require(h != address(0), "NO_TOKEN");
        Passport memory p = passportOf[h];
        // Compact JSON data URI — renders the live score in any NFT viewer.
        return string(
            abi.encodePacked(
                "data:application/json;utf8,",
                '{"name":"RWAkins Credit Passport #',
                _toString(tokenId),
                '","description":"Soulbound on-chain credit score for the RWAkins AI x RWA economy.",',
                '"attributes":[{"trait_type":"Score","value":',
                _toString(p.score),
                '},{"trait_type":"Band","value":',
                _toString(p.band),
                "}]}"
            )
        );
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        // ERC-165 + ERC-721 (read surface) + ERC-721 Metadata.
        return interfaceId == 0x01ffc9a7 || interfaceId == 0x80ac58cd || interfaceId == 0x5b5e139f;
    }

    // ── Soulbound: every transfer/approval path reverts ──────────────────────
    function transferFrom(address, address, uint256) external pure {
        revert Soulbound();
    }

    function safeTransferFrom(address, address, uint256) external pure {
        revert Soulbound();
    }

    function safeTransferFrom(address, address, uint256, bytes calldata) external pure {
        revert Soulbound();
    }

    function approve(address, uint256) external pure {
        revert Soulbound();
    }

    function setApprovalForAll(address, bool) external pure {
        revert Soulbound();
    }

    function getApproved(uint256) external pure returns (address) {
        return address(0);
    }

    function isApprovedForAll(address, address) external pure returns (bool) {
        return false;
    }

    // ── util ─────────────────────────────────────────────────────────────────
    function _toString(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 d;
        uint256 t = v;
        while (t != 0) {
            d++;
            t /= 10;
        }
        bytes memory b = new bytes(d);
        while (v != 0) {
            d--;
            b[d] = bytes1(uint8(48 + (v % 10)));
            v /= 10;
        }
        return string(b);
    }
}
