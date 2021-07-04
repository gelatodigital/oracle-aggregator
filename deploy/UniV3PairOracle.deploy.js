module.exports = async (hre) => {
  const disabled = false;
  if (disabled) {
    console.log(
      "to deploy UniV3PairOracle set `disabled` to false in MockOracle.deploy.js"
    );
    return;
  }
  const { deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await hre.getNamedAccounts();

  const instWethPool = "0xCba27C8e7115b4Eb50Aa14999BC0866674a96eCB";

  const uniV3Oracle = await deploy("UniV3PairOracle", {
    from: deployer,
    args: [instWethPool], // ETH/USD  1:1500
  });

  console.log(`UniV3PairOracle oracle: ${uniV3Oracle.address}`);
};
module.exports.tags = ["UniV3PairOracle"];
