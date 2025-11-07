const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Déploiement du Token Kamina...");
  
  const [deployer] = await ethers.getSigners();
  console.log("👤 Compte de déploiement:", deployer.address);
  
  // Déploiement KaminaToken
  const KaminaToken = await ethers.getContractFactory("KaminaToken");
  const kamina = await KaminaToken.deploy();
  
  const kaminaAddress = await kamina.getAddress();
  console.log("✅ KaminaToken déployé à:", kaminaAddress);
  console.log("💰 Supply total:", (await kamina.totalSupply()).toString());
  console.log("🎯 Symbole:", await kamina.symbol());
  console.log("📝 Nom:", await kamina.name());
  
  console.log("🎉 KAMINA TOKEN DÉPLOYÉ AVEC SUCCÈS!");
}

main().catch((error) => {
  console.error("❌ Erreur:", error);
  process.exitCode = 1;
});