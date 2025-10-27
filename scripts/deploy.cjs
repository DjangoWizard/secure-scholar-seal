const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("Deploying SecureScholarSeal contract...");

  // Get the contract factory
  const SecureScholarSeal = await ethers.getContractFactory("SecureScholarSeal");

  // Deploy the contract
  const verifier = "0x3c7fae276c590a8df81ed320851c53db4bc39916";
  const institutionManager = "0x3c7fae276c590a8df81ed320851c53db4bc39916";

  console.log("Deploying contract...");
  const contract = await SecureScholarSeal.deploy(verifier, institutionManager);

  console.log("Waiting for deployment...");
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("SecureScholarSeal deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: "sepolia",
    verifier: verifier,
    institutionManager: institutionManager,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  
  console.log("Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
