module.exports = async (hre) => {
  const disabled = false;
  if (disabled) {
    console.log(
      "to deploy UniV3Oracle set `disabled` to false in MockOracle.deploy.js"
    );
    return;
  }
  const { deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await hre.getNamedAccounts();

  const uniV3Oracle = await deploy("UniV3Oracle", {
    from: deployer,
    args: [],
  });

  console.log(`UniV3Oracle address: ${uniV3Oracle.address}`);
};
module.exports.tags = ["UniV3Oracle"];
