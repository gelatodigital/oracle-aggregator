const { ethers, deployments, network } = require("hardhat");
const { expect } = require("chai");
//const { computeChainlinkPrice, getAllTestPairs, symbols } = require("./helper");

const ETH_ADDRESS = network.config.addresses.ethAddress;
//const USD_ADDRESS = network.config.addresses.usdAddress;

describe("OracleAggregator V2 TEST", async function () {
  let oracleAggregator;
  let uniV3Oracle;

  this.timeout(0);

  before(async function () {
    await deployments.fixture();
    oracleAggregator = await ethers.getContract("OracleAggregator");
    uniV3Oracle = await ethers.getContract("UniV3PairOracle");
    // console.log("❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆");
    // console.log("🔵Contract address:", oracleAggregator.address);
  });

  it("Add USDC / WETH UniV3 Oracle to oracleAggregator and test return value", async () => {
    // ADD ADDRESSES TO CONFIG
    // Check that Owner cannot update existing oracles
    // console.log(uniV3Oracle.address)
    // console.log(network.config.addresses.instAddress)
    // console.log(network.config.addresses.wethAddress)
    const uniV3OracleFactory = await ethers.getContractFactory(
      "UniV3PairOracle"
    );
    const uniV3Pool = "0x73A6a761FE483bA19DeBb8f56aC5bbF14c0cdad1";
    const sushiOracle = await uniV3OracleFactory.deploy(uniV3Pool);
    const sushiAddress = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2";

    await expect(
      oracleAggregator.addTokens(
        [sushiAddress],
        [ETH_ADDRESS],
        // deployed oracle address
        [sushiOracle.address]
      )
    );

    const isWhitelisted = await oracleAggregator.checkIfOracleIsWhitelisted(
      sushiAddress,
      ETH_ADDRESS
    );

    expect(isWhitelisted).to.be.true;

    const amountIn = ethers.utils.parseUnits("1", "18");

    const [
      returnAmount,
      returnDecimals,
    ] = await oracleAggregator.getExpectedReturnAmount(
      amountIn,
      sushiAddress,
      ETH_ADDRESS
    );

    console.log(returnAmount.toString());
    console.log(returnDecimals.toString());
  });

  it("Add INST / WETH UniV3 Oracle to oracleAggregator and test return value", async () => {
    // ADD ADDRESSES TO CONFIG
    // Check that Owner cannot update existing oracles
    // console.log(uniV3Oracle.address)
    // console.log(network.config.addresses.instAddress)
    // console.log(network.config.addresses.wethAddress)
    const instAddress = "0x6f40d4a6237c257fff2db00fa0510deeecd303eb";
    await expect(
      oracleAggregator.addTokens(
        [instAddress],
        [ETH_ADDRESS],
        // deployed oracle address
        [uniV3Oracle.address]
      )
    );

    const isWhitelisted = await oracleAggregator.checkIfOracleIsWhitelisted(
      instAddress,
      ETH_ADDRESS
    );

    expect(isWhitelisted).to.be.true;

    const amountIn = ethers.utils.parseUnits("1000", "18");

    const [
      returnAmount,
      returnDecimals,
    ] = await oracleAggregator.getExpectedReturnAmount(
      amountIn,
      instAddress,
      ETH_ADDRESS
    );

    console.log(returnAmount.toString());
    console.log(returnDecimals.toString());
  });
});
