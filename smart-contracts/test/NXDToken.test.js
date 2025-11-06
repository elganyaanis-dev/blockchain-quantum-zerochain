// 🧪 Tests pour le Smart Contract NXDToken
// Blockchain Quantum Zero-Chain - Suite de tests

const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('NXDToken Smart Contract', function () {
  let nxdToken;
  let owner;
  let user1;
  let user2;
  let initialSupply = 1000000;

  beforeEach(async function () {
    // Récupère les signers
    [owner, user1, user2] = await ethers.getSigners();
    
    // Déploie le contrat
    const NXDToken = await ethers.getContractFactory('NXDToken');
    nxdToken = await NXDToken.deploy(initialSupply);
    await nxdToken.waitForDeployment();
  });

  describe('Déploiement', function () {
    it('Should set the right owner', async function () {
      expect(await nxdToken.owner()).to.equal(owner.address);
    });

    it('Should assign the total supply of tokens to the owner', async function () {
      const ownerBalance = await nxdToken.balanceOf(owner.address);
      expect(await nxdToken.totalSupply()).to.equal(ownerBalance);
    });

    it('Should have correct token metadata', async function () {
      expect(await nxdToken.name()).to.equal('Quantum Zero-Chain Token');
      expect(await nxdToken.symbol()).to.equal('NXD');
      expect(await nxdToken.decimals()).to.equal(18);
    });
  });

  describe('Transactions', function () {
    it('Should transfer tokens between accounts', async function () {
      // Transfer 100 tokens from owner to user1
      await nxdToken.transfer(user1.address, ethers.parseEther('100'));
      const user1Balance = await nxdToken.balanceOf(user1.address);
      expect(user1Balance).to.equal(ethers.parseEther('100'));

      // Transfer 50 tokens from user1 to user2
      await nxdToken.connect(user1).transfer(user2.address, ethers.parseEther('50'));
      const user2Balance = await nxdToken.balanceOf(user2.address);
      expect(user2Balance).to.equal(ethers.parseEther('50'));
    });

    it('Should fail if sender doesn’t have enough tokens', async function () {
      const initialOwnerBalance = await nxdToken.balanceOf(owner.address);
      
      // Try to send 1 token from user1 (0 tokens) to owner
      await expect(
        nxdToken.connect(user1).transfer(owner.address, 1)
      ).to.be.revertedWith('NXD: insufficient balance');

      // Owner balance shouldn't have changed
      expect(await nxdToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it('Should update balances after transfers', async function () {
      const initialOwnerBalance = await nxdToken.balanceOf(owner.address);

      // Transfer 100 tokens to user1
      await nxdToken.transfer(user1.address, ethers.parseEther('100'));

      // Transfer 100 tokens from user1 to user2
      await nxdToken.connect(user1).transfer(user2.address, ethers.parseEther('100'));

      // Check final balances
      const finalOwnerBalance = await nxdToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - ethers.parseEther('100'));

      const user1Balance = await nxdToken.balanceOf(user1.address);
      expect(user1Balance).to.equal(0);

      const user2Balance = await nxdToken.balanceOf(user2.address);
      expect(user2Balance).to.equal(ethers.parseEther('100'));
    });
  });

  describe('Minting and Burning', function () {
    it('Should mint new tokens', async function () {
      const initialSupply = await nxdToken.totalSupply();
      
      await nxdToken.mint(user1.address, ethers.parseEther('500'));
      
      const finalSupply = await nxdToken.totalSupply();
      expect(finalSupply).to.equal(initialSupply + ethers.parseEther('500'));
      
      const user1Balance = await nxdToken.balanceOf(user1.address);
      expect(user1Balance).to.equal(ethers.parseEther('500'));
    });

    it('Should burn tokens', async function () {
      // First transfer some tokens to user1
      await nxdToken.transfer(user1.address, ethers.parseEther('200'));
      
      const initialSupply = await nxdToken.totalSupply();
      const initialUserBalance = await nxdToken.balanceOf(user1.address);
      
      // User1 burns 100 tokens
      await nxdToken.connect(user1).burn(ethers.parseEther('100'));
      
      const finalSupply = await nxdToken.totalSupply();
      expect(finalSupply).to.equal(initialSupply - ethers.parseEther('100'));
      
      const finalUserBalance = await nxdToken.balanceOf(user1.address);
      expect(finalUserBalance).to.equal(initialUserBalance - ethers.parseEther('100'));
    });

    it('Should not allow non-owner to mint', async function () {
      await expect(
        nxdToken.connect(user1).mint(user1.address, ethers.parseEther('1000'))
      ).to.be.revertedWith('NXD: caller is not owner');
    });
  });

  describe('Allowances', function () {
    it('Should approve tokens for delegated transfer', async function () {
      await nxdToken.approve(user1.address, ethers.parseEther('100'));
      const allowance = await nxdToken.allowance(owner.address, user1.address);
      expect(allowance).to.equal(ethers.parseEther('100'));
    });

    it('Should transfer from with allowance', async function () {
      await nxdToken.approve(user1.address, ethers.parseEther('100'));
      
      await nxdToken.connect(user1).transferFrom(
        owner.address, 
        user2.address, 
        ethers.parseEther('50')
      );
      
      const user2Balance = await nxdToken.balanceOf(user2.address);
      expect(user2Balance).to.equal(ethers.parseEther('50'));
      
      const remainingAllowance = await nxdToken.allowance(owner.address, user1.address);
      expect(remainingAllowance).to.equal(ethers.parseEther('50'));
    });
  });
});

console.log('✅ Tous les tests NXDToken sont configurés!');