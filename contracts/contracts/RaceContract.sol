// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RaceContract
 * @dev Manages cockroach races, betting, and race lifecycle
 */
contract RaceContract is Ownable, ReentrancyGuard {
    
    struct Race {
        uint256 id;
        uint256 entryFee;
        uint256 maxPlayers;
        uint256 currentPlayers;
        uint256 totalPot;
        address[] players;
        uint256[] cockroachIds;
        uint256 winner;
        bool started;
        bool finalized;
        uint256 createdAt;
        uint256 startedAt;
        uint256 finalizedAt;
    }
    
    uint256 public raceCounter;
    uint256 public platformFeePercent = 5; // 5% platform fee
    address public feeCollector;
    
    mapping(uint256 => Race) public races;
    mapping(address => uint256) public playerBalances;
    
    event RaceCreated(uint256 indexed raceId, uint256 entryFee, uint256 maxPlayers, uint256 timestamp);
    event RaceJoined(uint256 indexed raceId, address indexed player, uint256 cockroachId, uint256 timestamp);
    event RaceStarted(uint256 indexed raceId, uint256 timestamp);
    event RaceFinalized(uint256 indexed raceId, uint256 winner, address winnerAddress, uint256 payout, uint256 timestamp);
    event BalanceWithdrawn(address indexed player, uint256 amount);
    event FeeCollected(uint256 indexed raceId, uint256 amount);
    
    constructor() Ownable(msg.sender) {
        feeCollector = msg.sender;
    }
    
    /**
     * @dev Creates a new race
     */
    function createRace(uint256 _entryFee, uint256 _maxPlayers) external returns (uint256) {
        require(_entryFee > 0, "Entry fee must be greater than 0");
        require(_maxPlayers >= 2 && _maxPlayers <= 10, "Max players must be between 2 and 10");
        
        raceCounter++;
        
        Race storage race = races[raceCounter];
        race.id = raceCounter;
        race.entryFee = _entryFee;
        race.maxPlayers = _maxPlayers;
        race.currentPlayers = 0;
        race.totalPot = 0;
        race.started = false;
        race.finalized = false;
        race.createdAt = block.timestamp;
        
        emit RaceCreated(raceCounter, _entryFee, _maxPlayers, block.timestamp);
        
        return raceCounter;
    }
    
    /**
     * @dev Join a race with a bet
     */
    function joinRace(uint256 _raceId, uint256 _cockroachId) external payable nonReentrant {
        Race storage race = races[_raceId];
        
        require(race.id != 0, "Race does not exist");
        require(!race.started, "Race already started");
        require(race.currentPlayers < race.maxPlayers, "Race is full");
        require(msg.value == race.entryFee, "Incorrect entry fee");
        require(!hasJoinedRace(_raceId, msg.sender), "Already joined this race");
        
        race.players.push(msg.sender);
        race.cockroachIds.push(_cockroachId);
        race.currentPlayers++;
        race.totalPot += msg.value;
        
        emit RaceJoined(_raceId, msg.sender, _cockroachId, block.timestamp);
    }
    
    /**
     * @dev Start a race
     */
    function startRace(uint256 _raceId) external {
        Race storage race = races[_raceId];
        
        require(race.id != 0, "Race does not exist");
        require(!race.started, "Race already started");
        require(race.currentPlayers >= 2, "Not enough players");
        
        race.started = true;
        race.startedAt = block.timestamp;
        
        emit RaceStarted(_raceId, block.timestamp);
    }
    
    /**
     * @dev Finalize race with winner
     * @param _raceId Race ID
     * @param _winnerIndex Index of winner in players array (0-based)
     */
    function finalizeRace(uint256 _raceId, uint256 _winnerIndex) external onlyOwner nonReentrant {
        Race storage race = races[_raceId];
        
        require(race.id != 0, "Race does not exist");
        require(race.started, "Race not started");
        require(!race.finalized, "Race already finalized");
        require(_winnerIndex < race.currentPlayers, "Invalid winner index");
        
        race.finalized = true;
        race.winner = _winnerIndex;
        race.finalizedAt = block.timestamp;
        
        // Calculate payout
        uint256 platformFee = (race.totalPot * platformFeePercent) / 100;
        uint256 winnerPayout = race.totalPot - platformFee;
        
        address winner = race.players[_winnerIndex];
        
        // Credit winner balance
        playerBalances[winner] += winnerPayout;
        
        // Collect platform fee
        playerBalances[feeCollector] += platformFee;
        
        emit FeeCollected(_raceId, platformFee);
        emit RaceFinalized(_raceId, race.cockroachIds[_winnerIndex], winner, winnerPayout, block.timestamp);
    }
    
    /**
     * @dev Withdraw balance
     */
    function withdraw() external nonReentrant {
        uint256 balance = playerBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");
        
        playerBalances[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");
        
        emit BalanceWithdrawn(msg.sender, balance);
    }
    
    /**
     * @dev Check if player has joined a race
     */
    function hasJoinedRace(uint256 _raceId, address _player) public view returns (bool) {
        Race storage race = races[_raceId];
        for (uint256 i = 0; i < race.players.length; i++) {
            if (race.players[i] == _player) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Get race details
     */
    function getRace(uint256 _raceId) external view returns (Race memory) {
        return races[_raceId];
    }
    
    /**
     * @dev Get race players
     */
    function getRacePlayers(uint256 _raceId) external view returns (address[] memory) {
        return races[_raceId].players;
    }
    
    /**
     * @dev Get race cockroach IDs
     */
    function getRaceCockroachIds(uint256 _raceId) external view returns (uint256[] memory) {
        return races[_raceId].cockroachIds;
    }
    
    /**
     * @dev Update platform fee
     */
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 20, "Fee too high");
        platformFeePercent = _feePercent;
    }
    
    /**
     * @dev Update fee collector
     */
    function setFeeCollector(address _feeCollector) external onlyOwner {
        require(_feeCollector != address(0), "Invalid address");
        feeCollector = _feeCollector;
    }
    
    /**
     * @dev Get player balance
     */
    function getBalance(address _player) external view returns (uint256) {
        return playerBalances[_player];
    }
}
