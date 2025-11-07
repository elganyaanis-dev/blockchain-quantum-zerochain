// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract KaminaToken {
    string public constant name = "Kamina Token";
    string public constant symbol = "KAMINA";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balances;
    address public owner;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    constructor() {
        owner = msg.sender;
        totalSupply = 1000000000 * 10 ** decimals; // 1 billion
        balances[owner] = totalSupply;
        emit Transfer(address(0), owner, totalSupply);
    }
    
    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }
    
    function transfer(address to, uint256 amount) public returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
}