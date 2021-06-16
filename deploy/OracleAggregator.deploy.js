const { sleep } = require("@gelatonetwork/core");
const { getAggregatedOracles } = require("../test/helper");

module.exports = async (hre) => {
  const disabled = false;
  if (disabled) {
    console.log(
      "to deploy OracleAggregator set `disabled` to false in MockOracle.deploy.js"
    );
    return;
  }
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

  const { tokensA, tokensB, oracles } = getAggregatedOracles();

  await deploy("OracleAggregator", {
    from: deployer,
    args: [hre.network.config.addresses.wethAddress, tokensA, tokensB, oracles],
  });
};
module.exports.tags = ["OracleAggregator"];
