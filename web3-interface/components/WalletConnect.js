// 🌐 WalletConnect Component - Interface Web3
// Blockchain Quantum Zero-Chain - Module Web3 Interface

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

/**
 * Composant de connexion Wallet pour la Blockchain Quantum Zero-Chain
 * Support: MetaMask, WalletConnect, Coinbase Wallet
 */
const WalletConnect = () => {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [nxdBalance, setNXDBalance] = useState('0');

  // NXD Token Contract Address (à remplacer par l'adresse réelle)
  const NXD_TOKEN_ADDRESS = "0x..."; 
  const ETHEREUM_BRIDGE_ADDRESS = "0x...";

  // ABI simplifié pour NXDToken
  const NXD_TOKEN_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
  ];

  useEffect(() => {
    checkWalletConnection();
  }, []);

  /**
   * Vérifie si le wallet est déjà connecté
   */
  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        
        if (accounts.length > 0) {
          await setupWallet(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  /**
   * Connecte le wallet MetaMask
   */
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Veuillez installer MetaMask!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      await setupWallet(accounts[0]);
      
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Erreur de connexion au wallet");
    }
  };

  /**
   * Configure le wallet connecté
   */
  const setupWallet = async (accountAddress) => {
    const web3Provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(web3Provider);

    setAccount(accountAddress);
    setIsConnected(true);

    // Récupère le solde ETH
    const balance = await web3Provider.getBalance(accountAddress);
    setBalance(ethers.formatEther(balance));

    // Récupère le solde NXD
    await getNXDBalance(accountAddress, web3Provider);
  };

  /**
   * Récupère le solde de NXD
   */
  const getNXDBalance = async (accountAddress, web3Provider) => {
    try {
      const tokenContract = new ethers.Contract(
        NXD_TOKEN_ADDRESS, 
        NXD_TOKEN_ABI, 
        web3Provider
      );
      
      const balance = await tokenContract.balanceOf(accountAddress);
      const decimals = await tokenContract.decimals();
      
      setNXDBalance(ethers.formatUnits(balance, decimals));
    } catch (error) {
      console.error("Error fetching NXD balance:", error);
    }
  };

  /**
   * Déconnecte le wallet
   */
  const disconnectWallet = () => {
    setAccount('');
    setBalance('0');
    setNXDBalance('0');
    setIsConnected(false);
    setProvider(null);
  };

  /**
   * Formatte l'adresse du wallet
   */
  const formatAddress = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="wallet-connect-container">
      <div className="wallet-card">
        <h2>🌐 Quantum Zero-Chain Wallet</h2>
        
        {!isConnected ? (
          <button 
            className="connect-btn"
            onClick={connectWallet}
          >
            🔗 Connecter MetaMask
          </button>
        ) : (
          <div className="wallet-info">
            <div className="account-info">
              <strong>👤 Compte:</strong> 
              <span>{formatAddress(account)}</span>
            </div>
            
            <div className="balance-info">
              <strong>💰 ETH:</strong> 
              <span>{parseFloat(balance).toFixed(4)} ETH</span>
            </div>
            
            <div className="nxd-balance">
              <strong>🪙 NXD:</strong> 
              <span>{parseFloat(nxdBalance).toFixed(2)} NXD</span>
            </div>
            
            <div className="bridge-actions">
              <h3>🌉 Actions Bridge</h3>
              <button className="action-btn">
                🔒 Verrouiller NXD → Quantum Chain
              </button>
              <button className="action-btn">
                🔓 Déverrouiller Quantum Chain → Ethereum
              </button>
            </div>
            
            <button 
              className="disconnect-btn"
              onClick={disconnectWallet}
            >
              🚪 Déconnecter
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .wallet-connect-container {
          font-family: 'Arial', sans-serif;
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .wallet-card {
          background: #1a1a1a;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 4px 15px rgba(0, 255, 255, 0.2);
          border: 1px solid #00ffff;
        }
        
        h2 {
          color: #00ffff;
          text-align: center;
          margin-bottom: 20px;
        }
        
        .connect-btn {
          background: linear-gradient(45deg, #00ffff, #0080ff);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 25px;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
          transition: transform 0.2s;
        }
        
        .connect-btn:hover {
          transform: scale(1.05);
        }
        
        .wallet-info {
          color: white;
        }
        
        .account-info, .balance-info, .nxd-balance {
          margin: 15px 0;
          padding: 10px;
          background: rgba(0, 255, 255, 0.1);
          border-radius: 8px;
        }
        
        .bridge-actions {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #00ffff;
        }
        
        .action-btn {
          background: rgba(0, 255, 255, 0.2);
          color: white;
          border: 1px solid #00ffff;
          padding: 10px 15px;
          border-radius: 8px;
          margin: 5px;
          cursor: pointer;
          width: calc(100% - 10px);
        }
        
        .action-btn:hover {
          background: rgba(0, 255, 255, 0.3);
        }
        
        .disconnect-btn {
          background: #ff4444;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          width: 100%;
          margin-top: 15px;
        }
      `}</style>
    </div>
  );
};

export default WalletConnect;