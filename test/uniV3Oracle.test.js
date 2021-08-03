const { ethers, deployments, network } = require("hardhat");
const { expect } = require("chai");

const QUOTER = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

const WETH_ADDRESS = network.config.addresses.wethAddress;
const UNI_ADDRESS = network.config.addresses.uniAddress;
const USDC_ADDRESS = network.config.addresses.usdcAddress;
const MKR_ADDRESS = network.config.addresses.mkrAddress;
const DAI_ADDRESS = network.config.addresses.daiAddress;
const FLOAT_ADDRESS = "0xb05097849BCA421A3f51B249BA6CCa4aF4b97cb9";

const USDC_WETH_POOL = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";
const UNI_WETH_POOL = "0x1d42064Fc4Beb5F8aAF85F4617AE8b3b5B8Bd801";
const MKR_WETH_POOL = "0xe8c6c9227491C0a8156A0106A0204d881BB7E531";
const DAI_USDC_POOL = "0x6c6Bc977E13Df9b0de53b251522280BB72383700";
const FLOAT_USDC_POOL = "0x7EE092FD479185Dd741E3E6994F255bB3624f765";
const FLOAT_WETH_POOL = "0xE8c2030686fC3b0161Ee1def0E8d01dFe4FAc0Ac";

// 1 percent percentage difference comparing price from
// uniV3Oracle to oracleAggregator/quoter
const MAX_PRICE_DIFF = 1;

describe("UniV3Oracle TEST", async function () {
  let oracleAggregator;
  let uniV3Oracle;
  let quoter;

  this.timeout(0);

  before(async function () {
    await deployments.fixture();
    oracleAggregator = await ethers.getContract("OracleAggregator");
    const _uniV3Oracle = await ethers.getContractFactory("UniV3Oracle");
    const _quoter = await ethers.getContractFactory("Quoter");

    uniV3Oracle = await _uniV3Oracle.deploy();
    quoter = await _quoter.deploy(QUOTER);
  });

  it("Revert if wrong pools or tokens", async () => {
    const amountIn = ethers.utils.parseEther("1");

    await expect(
      uniV3Oracle.getExpectedReturnAmount(
        amountIn,
        [UNI_ADDRESS, WETH_ADDRESS, USDC_ADDRESS],
        [UNI_WETH_POOL, DAI_USDC_POOL]
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
        amountIn,
        [UNI_ADDRESS, WETH_ADDRESS],
        [UNI_WETH_POOL]
      );

    const [uniWeth_oracle, oracle_decimals] =
      await oracleAggregator.getExpectedReturnAmount(
        amountIn,
        UNI_ADDRESS,
        WETH_ADDRESS
      );

    const perc = percentageDiff(uniWeth_oracle, uniWeth_twap);
    console.log("Percentage difference: ", perc);

    expect(twap_decimals).to.be.eql(oracle_decimals);
    expect(perc).to.be.lessThan(MAX_PRICE_DIFF);

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
        amountIn,
        [WETH_ADDRESS, USDC_ADDRESS],
        [USDC_WETH_POOL]
      );

    const [wethUsdc_oracle, oracle_decimals] =
      await oracleAggregator.getExpectedReturnAmount(
        amountIn,
        WETH_ADDRESS,
        USDC_ADDRESS
      );

    const perc = percentageDiff(wethUsdc_oracle, wethUsdc_twap);
    console.log("Percentage difference: ", perc);

    console.log("uniV3Oracle decimals: ", twap_decimals.toString());
    console.log("WETH/USDC from uniV3Oracle: ", wethUsdc_twap.toString());
    console.log(
      "WETH/USDC from oracleAggregator: ",
      wethUsdc_oracle.toString()
    );

    expect(twap_decimals).to.be.eql(oracle_decimals);
    expect(perc).to.be.lessThan(MAX_PRICE_DIFF);
  });

  it("Get UNI/USDC rate from UNI/WETH and WETH/USDC", async () => {
    // 1 hop
    // 18 dp to 6 dp
    const amountIn = ethers.utils.parseEther("1");
    const [uniUsdc_twap, twap_decimals] =
      await uniV3Oracle.getExpectedReturnAmount(
        amountIn,
        [UNI_ADDRESS, WETH_ADDRESS, USDC_ADDRESS],
        [UNI_WETH_POOL, USDC_WETH_POOL]
      );

    const [uniUsdc_oracle, oracle_decimals] =
      await oracleAggregator.getExpectedReturnAmount(
        amountIn,
        UNI_ADDRESS,
        USDC_ADDRESS
      );

    const perc = percentageDiff(uniUsdc_oracle, uniUsdc_twap);
    console.log("Percentage difference: ", perc);

    console.log("uniV3Oracle decimals: ", twap_decimals.toString());
    console.log("UNI/USDC from uniV3Oracle: ", uniUsdc_twap.toString());
    console.log("UNI/USDC from oracleAggregator: ", uniUsdc_oracle.toString());

    expect(twap_decimals).to.be.eql(oracle_decimals);
    expect(perc).to.be.lessThan(MAX_PRICE_DIFF);
  });

  it("Get USDC/UNI rate from USDC/WETH and WETH/UNI", async () => {
    // 1 hop
    // 6 dp to 18 dp
    const amountIn = 10 ** 6;
    const [usdcUni_twap, twap_decimals] =
      await uniV3Oracle.getExpectedReturnAmount(
        amountIn,
        [USDC_ADDRESS, WETH_ADDRESS, UNI_ADDRESS],
        [USDC_WETH_POOL, UNI_WETH_POOL]
      );

    const [usdcUni_oracle, oracle_decimals] =
      await oracleAggregator.getExpectedReturnAmount(
        amountIn,
        USDC_ADDRESS,
        UNI_ADDRESS
      );

    const perc = percentageDiff(usdcUni_oracle, usdcUni_twap);
    console.log("Percentage difference: ", perc);

    console.log("uniV3Oracle decimals: ", twap_decimals.toString());
    console.log("USDC/UNI from uniV3Oracle: ", usdcUni_twap.toString());
    console.log("USDC/UNI from oracleAggregator: ", usdcUni_oracle.toString());

    expect(twap_decimals).to.be.eql(oracle_decimals);
    expect(perc).to.be.lessThan(MAX_PRICE_DIFF);
  });

  it("Get UNI/MKR rate from UNI/WETH and WETH/LINK", async () => {
    // 1 hop
    // 18 dp to 18 dp
    const amountIn = ethers.utils.parseEther("1");
    const [uniMkr_twap, twap_decimals] =
      await uniV3Oracle.getExpectedReturnAmount(
        amountIn,
        [UNI_ADDRESS, WETH_ADDRESS, MKR_ADDRESS],
        [UNI_WETH_POOL, MKR_WETH_POOL]
      );

    const [uniMkr_oracle, oracle_decimals] =
      await oracleAggregator.getExpectedReturnAmount(
        amountIn,
        UNI_ADDRESS,
        MKR_ADDRESS
      );

    const perc = percentageDiff(uniMkr_oracle, uniMkr_twap);
    console.log("Percentage difference: ", perc);

    console.log("uniV3Oracle decimals: ", twap_decimals.toString());
    console.log("UNI/MKR from uniV3Oracle: ", uniMkr_twap.toString());
    console.log("UNI/MKR from oracleAggregator: ", uniMkr_oracle.toString());

    expect(twap_decimals).to.be.eql(oracle_decimals);
    expect(perc).to.be.lessThan(MAX_PRICE_DIFF);
  });

  it("Get UNI/DAI rate from UNI/WETH and WETH/USDC and USDC/DAI", async () => {
    // 2 hop
    // 18 dp to 18 dp
    const amountIn = ethers.utils.parseEther("1");
    const [uniDai_twap, twap_decimals] =
      await uniV3Oracle.getExpectedReturnAmount(
        amountIn,
        [UNI_ADDRESS, WETH_ADDRESS, USDC_ADDRESS, DAI_ADDRESS],
        [UNI_WETH_POOL, USDC_WETH_POOL, DAI_USDC_POOL]
      );

    const [uniDai_oracle, oracle_decimals] =
      await oracleAggregator.getExpectedReturnAmount(
        amountIn,
        UNI_ADDRESS,
        DAI_ADDRESS
      );

    const perc = percentageDiff(uniDai_oracle, uniDai_twap);
    console.log("Percentage difference: ", perc);

    console.log("uniV3Oracle decimals: ", twap_decimals.toString());
    console.log("UNI/DAI from uniV3Oracle: ", uniDai_twap.toString());
    console.log("UNI/DAI from oracleAggregator: ", uniDai_oracle.toString());

    expect(twap_decimals).to.be.eql(oracle_decimals);
    expect(perc).to.be.lessThan(MAX_PRICE_DIFF);
  });

  it("Get FLOAT/USDC rate from FLOAT/USDC", async () => {
    const amountIn = ethers.utils.parseEther("1");
    const expectedAmountOut = await quoter.callStatic.getAmountOut(
      amountIn,
      [FLOAT_ADDRESS, USDC_ADDRESS],
      [500]
    );

    const [floatUsdc, twap_decimals] =
      await uniV3Oracle.getExpectedReturnAmount(
        amountIn,
        [FLOAT_ADDRESS, USDC_ADDRESS],
        [FLOAT_USDC_POOL]
      );

    const perc = percentageDiff(expectedAmountOut, floatUsdc);
    console.log("Percentage difference: ", perc);

    console.log("uniV3Oracle decimals: ", twap_decimals.toString());
    console.log("FLOAT/USDC from uniV3Oracle: ", floatUsdc.toString());
    console.log("FLOAT/USDC from quoter: ", expectedAmountOut.toString());

    expect(perc).to.be.lessThan(MAX_PRICE_DIFF);
    expect(twap_decimals).to.be.eql(ethers.BigNumber.from("6"));
  });

  it("Get FLOAT/USDC rate from FLOAT/ETH, ETH/USDC", async () => {
    const amountIn = ethers.utils.parseEther("1");
    const expectedAmountOut = await quoter.callStatic.getAmountOut(
      amountIn,
      [FLOAT_ADDRESS, USDC_ADDRESS],
      [3000]
    );

    const [floatUsdc, twap_decimals] =
      await uniV3Oracle.getExpectedReturnAmount(
        amountIn,
        [FLOAT_ADDRESS, WETH_ADDRESS, USDC_ADDRESS],
        [FLOAT_WETH_POOL, USDC_WETH_POOL]
      );

    const perc = percentageDiff(expectedAmountOut, floatUsdc);
    console.log("Percentage difference: ", perc);

    console.log("uniV3Oracle decimals: ", twap_decimals.toString());
    console.log("FLOAT/USDC from uniV3Oracle: ", floatUsdc.toString());
    console.log("FLOAT/USDC from quoter: ", expectedAmountOut.toString());

    expect(perc).to.be.lessThan(MAX_PRICE_DIFF);
    expect(twap_decimals).to.be.eql(ethers.BigNumber.from("6"));
  });
});

const percentageDiff = (a, b) => {
  const perc = (Math.abs(a - b) / a) * 100;
  return Number(perc);
};
