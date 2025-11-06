// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../smart-contracts/contracts/NXDToken.sol";

/**
 * @title NXD Staking Protocol
 * @dev Pool de staking avec récompenses pour le token NXD
 * Protocole DeFi pour la Blockchain Quantum Zero-Chain
 */
contract NXDStaking {
    NXDToken public nxdToken;
    
    struct Staker {
        uint256 amount;
        uint256 rewardDebt;
        uint256 depositTime;
    }
    
    mapping(address => Staker) public stakers;
    uint256 public totalStaked;
    uint256 public rewardRate = 10; // 10% APY
    uint256 public constant REWARD_PRECISION = 1e18;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    
    constructor(address _nxdToken) {
        nxdToken = NXDToken(_nxdToken);
    }
    
    function stake(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");
        
        Staker storage staker = stakers[msg.sender];
        
        // Claim les récompenses existantes
        if (staker.amount > 0) {
            _claimRewards(msg.sender);
        }
        
        // Transfert des tokens
        require(nxdToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        // Mise à jour des données de staking
        staker.amount += _amount;
        staker.depositTime = block.timestamp;
        staker.rewardDebt = staker.amount * rewardRate / 100;
        
        totalStaked += _amount;
        
        emit Staked(msg.sender, _amount);
    }
    
    function unstake(uint256 _amount) external {
        Staker storage staker = stakers[msg.sender];
        require(staker.amount >= _amount, "Insufficient staked amount");
        
        // Claim les récompenses
        _claimRewards(msg.sender);
        
        // Mise à jour des données
        staker.amount -= _amount;
        totalStaked -= _amount;
        
        // Retour des tokens
        require(nxdToken.transfer(msg.sender, _amount), "Transfer failed");
        
        emit Unstaked(msg.sender, _amount);
    }
    
    function claimRewards() external {
        _claimRewards(msg.sender);
    }
    
    function _claimRewards(address _user) internal {
        Staker storage staker = stakers[_user];
        if (staker.amount == 0) return;
        
        uint256 pendingRewards = calculatePendingRewards(_user);
        if (pendingRewards > 0) {
            // Mint de nouvelles récompenses
            nxdToken.mint(_user, pendingRewards);
            emit RewardClaimed(_user, pendingRewards);
        }
        
        staker.rewardDebt = staker.amount * rewardRate / 100;
        staker.depositTime = block.timestamp;
    }
    
    function calculatePendingRewards(address _user) public view returns (uint256) {
        Staker memory staker = stakers[_user];
        if (staker.amount == 0) return 0;
        
        uint256 timeStaked = block.timestamp - staker.depositTime;
        uint256 annualReward = (st