const { sleep } = require("@gelatonetwork/core");
const { getAggregatedOraclesV2 } = require("../test/helper");

module.exports = async (hre) => {
  if (hre.network.name === "mainnet") {
    console.log(
      "\n\n Deploying OracleAggregator to mainnet. Hit ctrl + c to abort"
    );
    console.log("❗ OracleAggregator DEPLOYMENT: VERIFY");
    await sleep(10000);
  }
  const { deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await hre.getNamedAccounts();

  const { tokensA, tokensB, oracles } = getAggregatedOraclesV2();

  await deploy("OracleAggregator", {
    from: deployer,
    args: [hre.network.config.addresses.wethAddress, tokensA, tokensB, oracles],
  });
};
module.exports.tags = ["OracleAggregator"];
