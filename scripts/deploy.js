const { getAggregatedOracles } = require("../test/helper");
const { ethers, network } = require("hardhat");

async function main() {
  if (network.name == "mainnet") {
    console.log(
      "for safety mainnet deployment is disallowed by default\nsee scripts/deploy.js to allow"
    );
    return;
  }
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const {
    tokensA,
    tokensB,
    oracles,
    stablecoins,
    decimals,
  } = getAggregatedOracles();
  const GelatoOracleAggregator = await ethers.getContractFactory(
    "OracleAggregator",
    deployer
  );
  const contract = await GelatoOracleAggregator.deploy(
    network.config.addresses.wethAddress,
    tokensA,
    tokensB,
    oracles,
    stablecoins,
    decimals
  );

  console.log("Contract address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
