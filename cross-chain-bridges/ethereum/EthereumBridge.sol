// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../smart-contracts/contracts/NXDToken.sol";

/**
 * @title Ethereum Bridge for Quantum Zero-Chain
 * @dev Bridge cross-chain entre Ethereum et la Blockchain Quantum Zero-Chain
 * Frais quasi-nuls et transferts sécurisés
 */
contract EthereumBridge {
    NXDToken public nxdToken;
    address public quantumChainGateway;
    address public owner;
    
    mapping(bytes32 => bool) public processedTransactions;
    uint256 public bridgeFee = 0.001 ether; // Frais réduits
    
    event TokensLocked(
        address indexed user,
        uint256 amount,
        bytes32 quantumTxHash
    );
    
    event TokensUnlocked(
        address indexed user,
        uint256 amount,
        bytes32 ethereumTxHash
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier onlyQuantumGateway() {
        require(msg.sender == quantumChainGateway, "Only quantum gateway can call this");
        _;
    }
    
    constructor(address _nxdToken, address _quantumGateway) {
        nxdToken = NXDToken(_nxdToken);
        quantumChainGateway = _quantumGateway;
        owner = msg.sender;
    }
    
    /**
     * @dev Verrouille les tokens sur Ethereum pour les transférer vers Quantum Chain
     */
    function lockTokens(uint256 _amount, bytes32 _quantumTxHash) external payable {
        require(msg.value >= bridgeFee, "Insufficient bridge fee");
        require(_amount > 0, "Amount must be greater than 0");
        require(!processedTransactions[_quantumTxHash], "Transaction already processed");
        
        // Verrouille les tokens
        require(nxdToken.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");
        
        processedTransactions[_quantumTxHash] = true;
        
        emit TokensLocked(msg.sender, _amount, _quantumTxHash);
    }
    
    /**
     * @dev Déverrouille les tokens sur Ethereum après transfert depuis Quantum Chain
     */
    function unlockTokens(address _user, uint256 _amount, bytes32 _ethereumTxHash) external onlyQuantumGateway {
        require(!processedTransactions[_ethereumTxHash], "Transaction already processed");
        require(_amount > 0, "Amount must be greater than 0");
        
        // Libère les tokens vers l'utilisateur
        require(nxdToken.transfer(_user, _amount), "Token transfer failed");
        
        processedTransactions[_ethereumTxHash] = true;
        
        emit TokensUnlocked(_user, _amount, _ethereumTxHash);
    }
    
    /**
     * @dev Met à jour la gateway Quantum Chain
     */
    function updateQuantumGateway(address _newGateway) external onlyOwner {
        require(_newGateway != address(0), "Invalid gateway address");
        quantumChainGateway = _newGateway;
    }
    
    /**
     * @dev Met à jour les frais de bridge
     */
    function updateBridgeFee(uint256 _newFee) external onlyOwner {
        bridgeFee = _newFee;
    }
    
    /**
     * @dev Retire les frais accumulés
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(owner).transfer(balance);
    }
    
    /**
     * @dev Récupère le statut d'une transaction
     */
    function isTransactionProcessed(bytes32 _txHash) external view returns (bool) {
        return processedTransactions[_txHash];
    }
    
    /**
     * @dev Estimation des frais de bridge
     */
    function estimateBridgeFee() external view returns (uint256) {
        return bridgeFee;
    }
}