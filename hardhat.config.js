require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./smart-contracts/contracts",  // ✅ CORRECT
    tests: "./smart-contracts/test",         // ✅ CORRECT
    cache: "./cache",
    artifacts: "./artifacts"
  }
};