import pkg from 'hardhat';
const { ethers } = pkg;
import fs from 'fs';

async function main() {
  console.log("Deploying SecureScholarSeal contract...");

  // Get the contract factory
  const SecureScholarSeal = await ethers.getContractFactory("SecureScholarSeal");

  // Deploy the contract
  // You'll need to provide verifier and institutionManager addresses
  const verifier = "0x3c7fae276c590a8df81ed320851c53db4bc39916"; // Replace with actual verifier address
  const institutionManager = "0x3c7fae276c590a8df81ed320851c53db4bc39916"; // Replace with actual institution manager address

  const contract = await SecureScholarSeal.deploy(verifier, institutionManager);

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
