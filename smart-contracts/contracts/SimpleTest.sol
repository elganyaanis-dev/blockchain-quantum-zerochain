// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleTest {
    string public message = "Hello Quantum Blockchain";
    
    function getMessage() public view returns (string memory) {
        return message;
    }
}