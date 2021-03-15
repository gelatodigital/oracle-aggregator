module.exports = async (hre) => {
  const disabled = true;
  if (disabled) {
    console.log(
      "to deploy mock oracles set `disabled` to false in MockOracle.deploy.js"
    );
    return;
  }
  const { deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await hre.getNamedAccounts();

  const c1 = await deploy("MockOracle", {
    from: deployer,
    args: [1500 * 10 ** 8, 8], // ETH/USD  1:1500
  });

  console.log(`ETH/USD oracle: ${c1.address}`);

  const c2 = await deploy("MockOracle", {
    from: deployer,
    args: [hre.ethers.utils.parseEther("0.0015"), 18], // <ANY STABLECOIN>/ETH 1500:1
  });

  console.log(`STBLCOIN/ETH oracle: ${c2.address}`);

  const c3 = await deploy("MockOracle", {
    from: deployer,
    args: [hre.ethers.utils.parseEther("25"), 18], // WBTC/ETH 1:25
  });

  console.log(`WBTC/ETH oracle: ${c3.address}`);
};
