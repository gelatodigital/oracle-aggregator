const { ethers, deployments, network } = require("hardhat");
const { expect } = require("chai");

const uniFactoryAbi =
  require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json").abi;

const UNIFACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

const ETH_ADDRESS = network.config.addresses.ethAddress;
const WETH_ADDRESS = network.config.addresses.wethAddress;
const UNI_ADDRESS = network.config.addresses.uniAddress;
const LINK_ADDRESS = network.config.addresses.linkAddress;
const USDC_ADDRESS = network.config.addresses.usdcAddress;
const MKR_ADDRESS = network.config.addresses.mkrAddress;
const DAI_ADDRESS = network.config.addresses.daiAddress;

const USDC_WETH_POOL = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";
const UNI_WETH_POOL = "0x1d42064Fc4Beb5F8aAF85F4617AE8b3b5B8Bd801";
const LINK_WETH_POOL = "0xa6Cc3C2531FdaA6Ae1A3CA84c2855806728693e8";
const MKR_WETH_POOL = "0xe8c6c9227491C0a8156A0106A0204d881BB7E531";
const DAI_USDC_POOL = "0x6c6Bc977E13Df9b0de53b251522280BB72383700";

describe("UniV3Oracle TEST", async function () {
  let oracleAggregator;

  this.timeout(0);

  before(async function () {
    await deployments.fixture();
    oracleAggregator = await ethers.getContract("OracleAggregator");
    _uniV3Oracle = await ethers.getContractFactory("UniV3Oracle");

    uniV3Oracle = await _uniV3Oracle.deploy();

    uniswapFactory = await ethers.getContractAt(uniFactoryAbi, UNIFACTORY);
  });

  it("Revert if wrong pools or tokens", async () => {
    const amountIn = ethers.utils.parseEther("1");

    await expect(
      uniV3Oracle.getExpectedReturnAmount(
        [UNI_ADDRESS, WETH_ADDRESS, USDC_ADDRESS],
        [UNI_WETH_POOL, DAI_USDC_POOL],
        amountIn
      )
    ).to.be.revertedWith(
      "UniV3Oracle: getExpectedReturnAmount: Wrong pools or tokens"
    );
  });

  it("Get UNI/WETH rate", async () => {
    // direct route
    // 18dp to 18dp
    const amountIn = ethers.utils.parseEther("1");
    const [uniWeth_twap, twap_decimals] =
      await uniV3Oracle.getExpectedReturnAmount(
        [UNI_ADDRESS, WETH_ADDRESS],
        [UNI_WETH_POOL],
        amountIn
      );

    const [uniWeth_oracle, oracle_decimals] =
      await oracleAggregator.getExpectedReturnAmount(
        amountIn,
        UNI_ADDRESS,
        WETH_ADDRESS
      );

    expect(twap_decimals).to.be.eql(oracle_decimals);
    expect(uniWeth_twap.toString().length).to.be.eql(
      uniWeth_oracle.toString().length
    );

    console.log("uniV3Oracle decimals: ", twap_decimals.toString());
    console.log("UNI/WETH from uniV3Oracle: ", uniWeth_twap.toString());
    console.log("UNI/WETH from oracleAggregator: ", uniWeth_oracle.toString());
  });

  it("Get WETH/USDC rate", async () => {
    // direct route
    // 18dp to 6 dp
    const amountIn = ethers.utils.parseEther("1");
    const [wethUsdc_twap, twap_decimals] =
      await uniV3Oracle.getExpectedReturnAmount(
        [WETH_ADDRESS, USDC_ADDRESS],
        [USDC_WETH_POOL],
        amountIn
      );

    const [wethUsdc_oracle, oracle_decimals] =
      await oracleAggregator.getExpectedReturnAmount(
        amountIn,
        WETH_ADDRESS,
        USDC_ADDRESS
      );

    expect(twap_decimals).to.be.eql(oracle_decimals);
    expect(wethUsdc_twap.toString().length).to.be.eql(
      wethUsdc_oracle.toString().length
    );

    console.log("uniV3Oracle decimals: ", twap_decimals.toString());
    console.log("WETH/USDC from uniV3Oracle: ", wethUsdc_twap.toString());
    console.log(
      "WETH/USDC from oracleAggregator: ",
      wethUsdc_oracle.toString()
    );
  });

  it("Get UNI/USDC rate from UNI/WETH and WETH/USDC", async () => {
    // 1 hop
    // 18 dp to 6 dp
    const amountIn = ethers.utils.parseEther("1");
    const [uniUsdc_twap, twap_decimals] =
      await uniV3Oracle.getExpectedReturnAmount(
        [UNI_ADDRESS, WETH_ADDRESS, USDC_ADDRESS],
        [UNI_WETH_POOL, USDC_WETH_POOL],
        amountIn
      );

    const [uniUsdc_oracle, oracle_decimals] =
      await oracleAggregator.getExpectedReturnAmount(
        amountIn,
        UNI_ADDRESS,
        USDC_ADDRESS
      );

    expect(twap_decimals).to.be.eql(oracle_decimals);
    expect(uniUsdc_twap.toString().length).to.be.eql(
      uniUsdc_oracle.toString().length
    );

    console.log("uniV3Oracle decimals: ", twap_decimals.toString());
    console.log("UNI/USDC from uniV3Oracle: ", uniUsdc_twap.toString());
    console.log("UNI/USDC from oracleAggregator: ", uniUsdc_oracle.toString());
  });

  it("Get USDC/UNI rate from USDC/WETH and WETH/UNI", async () => {
    // 1 hop
    // 6 dp to 18 dp
    const amountIn = 10 ** 6;
    const [usdcUni_twap, twap_decimals] =
      await uniV3Oracle.getExpectedReturnAmount(
        [USDC_ADDRESS, WETH_ADDRESS, UNI_ADDRESS],
        [USDC_WETH_POOL, UNI_WETH_POOL],
        amountIn
      );

    const [usdcUni_oracle, oracle_decimals] =
      await oracleAggregator.getExpectedReturnAmount(
        amountIn,
        USDC_ADDRESS,
        UNI_ADDRESS
      );

    expect(twap_decimals).to.be.eql(oracle_decimals);
    expect(usdcUni_twap.toString().length).to.be.eql(
      usdcUni_oracle.toString().length
    );

    console.log("uniV3Oracle decimals: ", twap_decimals.toString());
    console.log("USDC/UNI from uniV3Oracle: ", usdcUni_twap.toString());
    console.log("USDC/UNI from oracleAggregator: ", usdcUni_oracle.toString());
  });

  it("Get UNI/MKR rate from UNI/WETH and WETH/LINK", async () => {
    // 1 hop
    // 18 dp to 18 dp
    const amountIn = ethers.utils.parseEther("1");
    const [uniMkr_twap, twap_decimals] =
      await uniV3Oracle.getExpectedReturnAmount(
        [UNI_ADDRESS, WETH_ADDRESS, MKR_ADDRESS],
        [UNI_WETH_POOL, MKR_WETH_POOL],
        amountIn
      );

    const [uniMkr_oracle, oracle_decimals] =
      await oracleAggregator.getExpectedReturnAmount(
        amountIn,
        UNI_ADDRESS,
        MKR_ADDRESS
      );

    expect(twap_decimals).to.be.eql(oracle_decimals);
    expect(uniMkr_twap.toString().length).to.be.eql(
      uniMkr_oracle.toString().length
    );

    console.log("uniV3Oracle decimals: ", twap_decimals.toString());
    console.log("UNI/MKR from uniV3Oracle: ", uniMkr_twap.toString());
    console.log("UNI/MKR from oracleAggregator: ", uniMkr_oracle.toString());
  });

  it("Get UNI/DAI rate from UNI/WETH and WETH/USDC and USDC/DAI", async () => {
    // 2 hop
    // 18 dp to 18 dp
    const amountIn = ethers.utils.parseEther("1");
    const [uniDai_twap, twap_decimals] =
      await uniV3Oracle.getExpectedReturnAmount(
        [UNI_ADDRESS, WETH_ADDRESS, USDC_ADDRESS, DAI_ADDRESS],
        [UNI_WETH_POOL, USDC_WETH_POOL, DAI_USDC_POOL],
        amountIn
      );

    const [uniDai_oracle, oracle_decimals] =
      await oracleAggregator.getExpectedReturnAmount(
        amountIn,
        UNI_ADDRESS,
        DAI_ADDRESS
      );

    expect(twap_decimals).to.be.eql(oracle_decimals);
    expect(uniDai_twap.toString().length).to.be.eql(
      uniDai_oracle.toString().length
    );

    console.log("uniV3Oracle decimals: ", twap_decimals.toString());
    console.log("UNI/DAI from uniV3Oracle: ", uniDai_twap.toString());
    console.log("UNI/DAI from oracleAggregator: ", uniDai_oracle.toString());
  });
});
