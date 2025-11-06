// 🚀 Script de Déploiement - Blockchain Quantum Zero-Chain
// Déploie NXDToken et les contrats associés

const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Démarrage du déploiement de la Blockchain Quantum Zero-Chain...");
  
  // Récupère le déployeur
  const [deployer] = await ethers.getSigners();
  console.log("👤 Déploiement avec le compte:", deployer.address);
  console.log("💰 Balance du déployeur:", (await deployer.provider.getBalance(deployer.address)).toString());

  // 1. Déploiement du Token NXD
  console.log("\n📦 Déploiement du NXDToken...");
  const NXDToken = await ethers.getContractFactory("NXDToken");
  const nxdToken = await NXDToken.deploy(1000000000); // 1 milliard de tokens
  await nxdToken.waitForDeployment();
  const nxdTokenAddress = await nxdToken.getAddress();
  console.log("✅ NXDToken déployé à:", nxdTokenAddress);

  // 2. Déploiement du Staking Pool
  console.log("\n🏦 Déploiement du NXDStaking...");
  const NXDStaking = await ethers.getContractFactory("NXDStaking");
  const nxdStaking = await NXDStaking.deploy(nxdTokenAddress);
  await nxdStaking.waitForDeployment();
  const nxdStakingAddress = await nxdStaking.getAddress();
  console.log("✅ NXDStaking déployé à:", nxdStakingAddress);

  // 3. Déploiement de l'Ethereum Bridge
  console.log("\n🌉 Déploiement de l'EthereumBridge...");
  const EthereumBridge = await ethers.getContractFactory("EthereumBridge");
  const ethereumBridge = await EthereumBridge.deploy(nxdTokenAddress, deployer.address);
  await ethereumBridge.waitForDeployment();
  const bridgeAddress = await ethereumBridge.getAddress();
  console.log("✅ EthereumBridge déployé à:", bridgeAddress);

  // Configuration des rôles et permissions
  console.log("\n⚙️ Configuration des permissions...");
  
  // Donner des droits de mint au bridge
  await nxdToken.updateMinter(bridgeAddress, true);
  console.log("✅ Bridge configuré comme minter");

  // Résumé du déploiement
  console.log("\n🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!");
  console.log("=====================================");
  console.log("🔮 NXDToken:", nxdTokenAddress);
  console.log("💰 NXDStaking:", nxdStakingAddress);
  console.log("🌉 EthereumBridge:", bridgeAddress);
  console.log("👤 Propriétaire:", deployer.address);
  console.log("=====================================");

  // Sauvegarde des adresses pour la production
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    timestamp: new Date().toISOString(),
    contracts: {
      nxdToken: nxdTokenAddress,
      nxdStaking: nxdStakingAddress,
      ethereumBridge: bridgeAddress
    },
    deployer: deployer.address
  };

  console.log("\n📄 Informations de déploiement:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erreur lors du déploiement:", error);
    process.exit(1);
  });