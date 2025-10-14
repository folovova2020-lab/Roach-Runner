const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying RaceContract...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  // Deploy RaceContract
  const RaceContract = await hre.ethers.getContractFactory("RaceContract");
  const raceContract = await RaceContract.deploy();
  await raceContract.waitForDeployment();
  
  const raceContractAddress = await raceContract.getAddress();
  console.log("RaceContract deployed to:", raceContractAddress);
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    raceContract: raceContractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to ${deploymentFile}`);
  
  // Copy ABI to frontend
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "RaceContract.sol", "RaceContract.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  const frontendAbiDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
  if (!fs.existsSync(frontendAbiDir)) {
    fs.mkdirSync(frontendAbiDir, { recursive: true });
  }
  
  const abiData = {
    address: raceContractAddress,
    abi: artifact.abi
  };
  
  fs.writeFileSync(
    path.join(frontendAbiDir, "RaceContract.json"),
    JSON.stringify(abiData, null, 2)
  );
  console.log("ABI copied to frontend");
  
  // Verify on Polygonscan (if not local)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await raceContract.deploymentTransaction().wait(6);
    
    console.log("Verifying contract on Polygonscan...");
    try {
      await hre.run("verify:verify", {
        address: raceContractAddress,
        constructorArguments: [],
      });
    } catch (error) {
      console.log("Verification error:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
