module.exports = async (hre) => {
  if (hre.network.name === "mainnet") {
    console.log("no need for mock oracles on mainnet");
    return;
  }
  const { deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await hre.getNamedAccounts();

  await deploy("MockOracle", {
    from: deployer,
    args: [1500 * 10 ** 8, 8], // ETH/USD  1:1500
  });

  await deploy("MockOracle", {
    from: deployer,
    args: [hre.ethers.utils.parseEther("0.0015"), 18], // <ANY STABLECOIN>/ETH 1500:1
  });

  await deploy("MockOracle", {
    from: deployer,
    args: [hre.ethers.utils.parseEther("25"), 18], // WBTC/ETH 1:25
  });
};
