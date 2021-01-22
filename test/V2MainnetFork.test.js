const { ethers, deployments, network } = require("hardhat");
const { expect } = require("chai");

function roundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

async function getPriceFromOracle(oracleAddress) {
  const ChainlinkOracle = await ethers.getContractAt(
    "contracts/interfaces/AggregatorV3Interface.sol:AggregatorV3Interface",
    oracleAddress
  );

  const oracleData = await ChainlinkOracle.latestRoundData();
  const oracleDecimals = await ChainlinkOracle.decimals();
  const oraclePrice =
    parseInt(oracleData.answer) / Math.pow(10, parseInt(oracleDecimals));

  return oraclePrice;
}

describe("OracleAggregator V2 TEST", async function () {
  var contract, returnAmount, nrOfDecimals;
  const ETH_ADDRESS = network.config.addresses.ethAddress;
  const BAT_ADDRESS = network.config.addresses.batAddress;
  const USD_ADDRESS = network.config.addresses.usdAddress;
  const BUSD_ADDRESS = network.config.addresses.busdAddress;
  const DAI_ADDRESS = network.config.addresses.daiAddress;
  const USDC_ADDRESS = network.config.addresses.usdcAddress;
  const USDK_ADDRESS = network.config.addresses.usdkAddress;
  const KNC_ADDRESS = network.config.addresses.kncAddress;
  const UNI_ADDRESS = network.config.addresses.uniAddress;
  const SXP_ADDRESS = network.config.addresses.sxpAddress;
  const AAVE_ADDRESS = network.config.addresses.aaveAddress;
  const WETH_ADDRESS = network.config.addresses.wethAddress;
  const ZRX_ADDRESS = network.config.addresses.zrxAddress;
  const USDT_ADDRESS = network.config.addresses.usdtAddress;
  const WBTC_ADDRESS = network.config.addresses.wbtcAddress;

  this.timeout(0);

  before(async function () {
    await deployments.fixture();
    contract = await ethers.getContract("OracleAggregatorV2");
    console.log("❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆");
    console.log("🔵Contract address:", contract.address);
  });

  // test direct oracle exists

  // using oracle USDC/ETH
  it("should get expected return amount and nrOfDecimals of USDC/ETH", async () => {
    const oneUsdc = 10 ** 6;
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneUsdc.toString(),
      USDC_ADDRESS,
      ETH_ADDRESS
    );

    console.log(
      "\n\n1 USDC/ETH returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("ETH nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceUsdEth = await getPriceFromOracle(
      network.config.oracles[USDC_ADDRESS][ETH_ADDRESS]
    );

    // Desired Return Amount
    const desiredReturnAmount = oraclePriceUsdEth;

    console.log(`1 USDC is worth ${desiredReturnAmount} ETH`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  // test share oracle

  // using oracles BUSD/ETH and USDC/ETH
  it("should get expected return amount and nrOfDecimals of USDC/BUSD", async () => {
    const oneUsdc = 10 ** 6;
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneUsdc.toString(),
      USDC_ADDRESS,
      BUSD_ADDRESS
    );

    console.log(
      "\n\n1 USDC/BUSD returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("BUSD nrOfDecimals: ", parseInt(nrOfDecimals));
    const oraclePriceBusdEth = await getPriceFromOracle(
      network.config.oracles[BUSD_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceUsdcEth = await getPriceFromOracle(
      network.config.oracles[USDC_ADDRESS][ETH_ADDRESS]
    );

    // Desired Return Amount
    const desiredReturnAmount = oraclePriceBusdEth / oraclePriceUsdcEth;

    console.log(`1 USDC is worth ${desiredReturnAmount} BUSD`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );

    // assuming both stablecoins are relatively near each other
    expect(
      Math.round(returnAmount / Math.pow(10, parseInt(nrOfDecimals)))
    ).to.be.equal(1);

    expect(nrOfDecimals).to.be.equal(18);
  });

  // using oracles UNI/ETH USDC/ETH
  it("should get expected return amount and nrOfDecimals of UNI/USDC", async () => {
    const oneUni = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneUni.toString(),
      UNI_ADDRESS,
      USDC_ADDRESS
    );

    console.log(
      "\n\n1 UNI/USDC returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("USDC nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceUniEth = await getPriceFromOracle(
      network.config.oracles[UNI_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceUsdcEth = await getPriceFromOracle(
      network.config.oracles[USDC_ADDRESS][ETH_ADDRESS]
    );

    // Desired Return Amount
    const desiredReturnAmount = oraclePriceUniEth / oraclePriceUsdcEth;

    console.log(`1 UNI is worth ${desiredReturnAmount} USDC`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(6);
  });

  // using oracles SXP/USD and ETH/USD
  it("should get expected return amount and nrOfDecimals of SXP/ETH", async () => {
    const oneSxp = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneSxp.toString(),
      SXP_ADDRESS,
      ETH_ADDRESS
    );

    console.log(
      "\n\n1 SXP/ETH returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("ETH nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceSxpUsd = await getPriceFromOracle(
      network.config.oracles[SXP_ADDRESS][USD_ADDRESS]
    );

    const oraclePriceEthUsd = await getPriceFromOracle(
      network.config.oracles[ETH_ADDRESS][USD_ADDRESS]
    );

    // Desired Return Amount
    const desiredReturnAmount = oraclePriceSxpUsd / oraclePriceEthUsd;

    console.log(`1 SXP is worth ${desiredReturnAmount} ETH`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  // using oracles KNC vs ETH and UNI vs ETH
  it("should get expected return amount of KNC/UNI", async () => {
    const oneKnc = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneKnc.toString(),
      KNC_ADDRESS,
      UNI_ADDRESS
    );

    console.log(
      "\n\n1 KNC/UNI returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("UNI nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceKncEth = await getPriceFromOracle(
      network.config.oracles[KNC_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceUniEth = await getPriceFromOracle(
      network.config.oracles[UNI_ADDRESS][ETH_ADDRESS]
    );

    // Desired Return Amount
    const desiredReturnAmount = oraclePriceKncEth / oraclePriceUniEth;

    console.log(`1 KNC is worth ${desiredReturnAmount} UNI`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  // test difficult pairs

  // test one token has oracle vs ETH while other vs USD
  it("should get expected return amount of UNI/SXP", async () => {
    const oneUni = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneUni.toString(),
      UNI_ADDRESS,
      SXP_ADDRESS
    );

    console.log(
      "\n\n1 UNI/SXP returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("SXP nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceUniEth = await getPriceFromOracle(
      network.config.oracles[UNI_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceSxpUsd = await getPriceFromOracle(
      network.config.oracles[SXP_ADDRESS][USD_ADDRESS]
    );

    const oraclePriceEthUsd = await getPriceFromOracle(
      network.config.oracles[ETH_ADDRESS][USD_ADDRESS]
    );

    // Desired Return Amount
    const desiredReturnAmount =
      (oraclePriceUniEth * oraclePriceEthUsd) / oraclePriceSxpUsd;

    console.log(`1 UNI is worth ${desiredReturnAmount} SXP`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  // test one token has oracle vs ETH while other vs USD
  it("should get expected return amount of SXP/UNI", async () => {
    const oneSxp = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneSxp.toString(),
      SXP_ADDRESS,
      UNI_ADDRESS
    );

    console.log(
      "\n\n1 SXP/UNI returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("UNI nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceUniEth = await getPriceFromOracle(
      network.config.oracles[UNI_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceSxpUsd = await getPriceFromOracle(
      network.config.oracles[SXP_ADDRESS][USD_ADDRESS]
    );

    const oraclePriceUsdEth = await getPriceFromOracle(
      network.config.oracles[USD_ADDRESS][ETH_ADDRESS]
    );

    // Desired Return Amount
    const desiredReturnAmount =
      (oraclePriceSxpUsd * oraclePriceUsdEth) / oraclePriceUniEth;

    console.log(`1 SXP is worth ${desiredReturnAmount} UNI`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  // using oracles ETH/USD USDC/ETH
  it("should get expected return amount and nrOfDecimals of ETH/USDC", async () => {
    const oneEth = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneEth.toString(),
      ETH_ADDRESS,
      USDC_ADDRESS
    );

    console.log(
      "\n\n1 ETH/USDC returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("ETH/USDC nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceUsdcEth = await getPriceFromOracle(
      network.config.oracles[USDC_ADDRESS][ETH_ADDRESS]
    );

    // Desired Return Amount
    const desiredReturnAmount = 1 / oraclePriceUsdcEth; // same as

    console.log(`1 ETH is worth ${desiredReturnAmount} USDC`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(6);
  });

  // using oracle USDK vs USD, ETH vs USD
  it("should get expected return amount and nrOfDecimals of USDK/ETH", async () => {
    const oneUsdk = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneUsdk.toString(),
      USDK_ADDRESS,
      ETH_ADDRESS
    );

    console.log(
      "\n\n1 USDK/ETH returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("ETH nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceUsdkUsd = await getPriceFromOracle(
      network.config.oracles[USDK_ADDRESS][USD_ADDRESS]
    );
    const oraclePriceEthUsd = await getPriceFromOracle(
      network.config.oracles[ETH_ADDRESS][USD_ADDRESS]
    );

    // Desired Return Amount
    const desiredReturnAmount = oraclePriceUsdkUsd / oraclePriceEthUsd;

    console.log(`1 USDK is worth ${desiredReturnAmount} ETH`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  // test using generic USD token address
  it("should get expected return amount of USD/AAVE", async () => {
    const oneDollar = 10 ** 8;
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneDollar.toString(),
      USD_ADDRESS,
      AAVE_ADDRESS
    );

    console.log(
      "\n\n1 USD/AAVE returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("AAVE nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceAaveEth = await getPriceFromOracle(
      network.config.oracles[AAVE_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceUsdEth = await getPriceFromOracle(
      network.config.oracles[USD_ADDRESS][ETH_ADDRESS]
    );

    // Desired Return Amount
    const desiredReturnAmount = oraclePriceUsdEth / oraclePriceAaveEth;

    console.log(`1 USD is worth ${desiredReturnAmount} AAVE`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  it("should get expected return amount of AAVE/USD", async () => {
    const oneAave = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneAave.toString(),
      AAVE_ADDRESS,
      USD_ADDRESS
    );

    console.log(
      "\n\n1 AAVE/USD returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("USD nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceAaveUsd = await getPriceFromOracle(
      network.config.oracles[AAVE_ADDRESS][USD_ADDRESS]
    );

    // Desired Return Amount
    const desiredReturnAmount = oraclePriceAaveUsd;

    console.log(`1 AAVE is worth ${desiredReturnAmount} USD`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(8);
  });

  it("should get expected return amount of AAVE/DAI", async () => {
    const oneAave = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneAave.toString(),
      AAVE_ADDRESS,
      DAI_ADDRESS
    );

    console.log(
      "\n\n1 AAVE/DAI returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("USD nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceAaveEth = await getPriceFromOracle(
      network.config.oracles[AAVE_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceDaiEth = await getPriceFromOracle(
      network.config.oracles[DAI_ADDRESS][ETH_ADDRESS]
    );

    // Desired Return Amount
    const desiredReturnAmount = oraclePriceAaveEth / oraclePriceDaiEth;

    console.log(`1 AAVE is worth ${desiredReturnAmount} DAI`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  it("should get expected return amount of AAVE/USDC", async () => {
    const oneAave = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneAave.toString(),
      AAVE_ADDRESS,
      USDC_ADDRESS
    );

    console.log(
      "\n\n1 AAVE/USDC returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("USDC nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceAaveEth = await getPriceFromOracle(
      network.config.oracles[AAVE_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceUsdcEth = await getPriceFromOracle(
      network.config.oracles[USDC_ADDRESS][ETH_ADDRESS]
    );

    // Desired Return Amount
    const desiredReturnAmount = oraclePriceAaveEth / oraclePriceUsdcEth;

    console.log(`1 AAVE is worth ${desiredReturnAmount} USDC`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(6);
  });

  it("should get expected return amount of ETH/DAI", async () => {
    const oneEth = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneEth.toString(),
      ETH_ADDRESS,
      DAI_ADDRESS
    );

    console.log(
      "\n\n1 ETH/DAI returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("DAI nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceEthDai = await getPriceFromOracle(
      network.config.oracles[DAI_ADDRESS][ETH_ADDRESS]
    );

    const inverseOraclePrice = 1 / oraclePriceEthDai;

    console.log(`1 ETH is worth ${inverseOraclePrice} DAI`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(inverseOraclePrice)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  it("should get expected return amount of DAI/ETH", async () => {
    const oneDai = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneDai.toString(),
      DAI_ADDRESS,
      ETH_ADDRESS
    );

    console.log(
      "\n\n1 DAI/ETH returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("ETH nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceEthDai = await getPriceFromOracle(
      network.config.oracles[DAI_ADDRESS][ETH_ADDRESS]
    );

    console.log(`1 DAI is worth ${oraclePriceEthDai} ETH`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(oraclePriceEthDai)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  it("should get expected return amount of BAT/DAI", async () => {
    const oneBat = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneBat.toString(),
      BAT_ADDRESS,
      DAI_ADDRESS
    );

    console.log(
      "\n\n1 BAT/DAI returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("DAI nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceBatEth = await getPriceFromOracle(
      network.config.oracles[BAT_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceEthDai = await getPriceFromOracle(
      network.config.oracles[DAI_ADDRESS][ETH_ADDRESS]
    );

    const desiredReturnAmount = oraclePriceBatEth / oraclePriceEthDai;

    console.log(`1 BAT is worth ${desiredReturnAmount} DAI`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  it("should get expected return amount of DAI/BAT", async () => {
    const oneDai = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneDai.toString(),
      DAI_ADDRESS,
      BAT_ADDRESS
    );

    console.log(
      "\n\n1 DAI/BAT returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("BAT nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceEthDai = await getPriceFromOracle(
      network.config.oracles[DAI_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceBatEth = await getPriceFromOracle(
      network.config.oracles[BAT_ADDRESS][ETH_ADDRESS]
    );

    const desiredReturnAmount = oraclePriceEthDai / oraclePriceBatEth;

    console.log(`1 DAI is worth ${desiredReturnAmount} BAT`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  // ZRX
  it("should get expected return amount of ZRX/DAI", async () => {
    const oneBat = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneBat.toString(),
      ZRX_ADDRESS,
      DAI_ADDRESS
    );

    console.log(
      "\n\n1 ZRX/DAI returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("DAI nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceZrxEth = await getPriceFromOracle(
      network.config.oracles[ZRX_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceEthDai = await getPriceFromOracle(
      network.config.oracles[DAI_ADDRESS][ETH_ADDRESS]
    );

    const desiredReturnAmount = oraclePriceZrxEth / oraclePriceEthDai;

    console.log(`1 ZRX is worth ${desiredReturnAmount} DAI`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  it("should get expected return amount of DAI/ZRX", async () => {
    const oneDai = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneDai.toString(),
      DAI_ADDRESS,
      ZRX_ADDRESS
    );

    console.log(
      "\n\n1 DAI/ZRX returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("ZRX nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceEthDai = await getPriceFromOracle(
      network.config.oracles[DAI_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceZrxEth = await getPriceFromOracle(
      network.config.oracles[ZRX_ADDRESS][ETH_ADDRESS]
    );

    const desiredReturnAmount = oraclePriceEthDai / oraclePriceZrxEth;

    console.log(`1 DAI is worth ${desiredReturnAmount} ZRX`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  // KNC
  it("should get expected return amount of KNC/DAI", async () => {
    const oneBat = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneBat.toString(),
      KNC_ADDRESS,
      DAI_ADDRESS
    );

    console.log(
      "\n\n1 KNC/DAI returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("DAI nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceKncEth = await getPriceFromOracle(
      network.config.oracles[KNC_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceEthDai = await getPriceFromOracle(
      network.config.oracles[DAI_ADDRESS][ETH_ADDRESS]
    );

    const desiredReturnAmount = oraclePriceKncEth / oraclePriceEthDai;

    console.log(`1 KNC is worth ${desiredReturnAmount} DAI`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  it("should get expected return amount of DAI/KNC", async () => {
    const oneDai = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneDai.toString(),
      DAI_ADDRESS,
      KNC_ADDRESS
    );

    console.log(
      "\n\n1 DAI/KNC returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("KNC nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceEthDai = await getPriceFromOracle(
      network.config.oracles[DAI_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceKncEth = await getPriceFromOracle(
      network.config.oracles[KNC_ADDRESS][ETH_ADDRESS]
    );

    const desiredReturnAmount = oraclePriceEthDai / oraclePriceKncEth;

    console.log(`1 DAI is worth ${desiredReturnAmount} KNC`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  // USDT
  it("should get expected return amount of USDT/DAI", async () => {
    const oneUsdt = ethers.utils.parseUnits("1", "6");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneUsdt.toString(),
      USDT_ADDRESS,
      DAI_ADDRESS
    );

    console.log(
      "\n\n1 USDT/DAI returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("DAI nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceUsdtEth = await getPriceFromOracle(
      network.config.oracles[USDT_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceEthDai = await getPriceFromOracle(
      network.config.oracles[DAI_ADDRESS][ETH_ADDRESS]
    );

    const desiredReturnAmount = oraclePriceUsdtEth / oraclePriceEthDai;

    console.log(`1 USDT is worth ${desiredReturnAmount} DAI`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  it("should get expected return amount of DAI/USDT", async () => {
    const oneDai = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneDai.toString(),
      DAI_ADDRESS,
      USDT_ADDRESS
    );

    console.log(
      "\n\n1 DAI/USDT returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("USDT nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceEthDai = await getPriceFromOracle(
      network.config.oracles[DAI_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceUsdtEth = await getPriceFromOracle(
      network.config.oracles[USDT_ADDRESS][ETH_ADDRESS]
    );

    const desiredReturnAmount = oraclePriceEthDai / oraclePriceUsdtEth;

    console.log(`1 DAI is worth ${desiredReturnAmount} USDT`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(6);
  });

  // WBTC
  it("should get expected return amount of WBTC/DAI", async () => {
    const oneWbtc = ethers.utils.parseUnits("1", "8");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneWbtc.toString(),
      WBTC_ADDRESS,
      DAI_ADDRESS
    );

    console.log(
      "\n\n1 WBTC/DAI returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("DAI nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceWbtcEth = await getPriceFromOracle(
      network.config.oracles[WBTC_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceEthDai = await getPriceFromOracle(
      network.config.oracles[DAI_ADDRESS][ETH_ADDRESS]
    );

    const desiredReturnAmount = oraclePriceWbtcEth / oraclePriceEthDai;

    console.log(`1 WBTC is worth ${desiredReturnAmount} DAI`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(18);
  });

  it("should get expected return amount of DAI/WBTC", async () => {
    const oneDai = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneDai.toString(),
      DAI_ADDRESS,
      WBTC_ADDRESS
    );

    console.log(
      "\n\n1 DAI/WBTC returnAmount: ",
      returnAmount / Math.pow(10, parseFloat(nrOfDecimals))
    );
    console.log("WBTC nrOfDecimals: ", parseFloat(nrOfDecimals));

    const oraclePriceEthDai = await getPriceFromOracle(
      network.config.oracles[DAI_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceWbtcEth = await getPriceFromOracle(
      network.config.oracles[WBTC_ADDRESS][ETH_ADDRESS]
    );

    const desiredReturnAmount = oraclePriceEthDai / oraclePriceWbtcEth;

    console.log(`1 DAI is worth ${desiredReturnAmount} WBTC`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(8);
  });

  it("should get expected return amount of USDC/USDT", async () => {
    const oneUsdc = ethers.utils.parseUnits("1", "6");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneUsdc.toString(),
      USDC_ADDRESS,
      USDT_ADDRESS
    );

    console.log(
      "\n\n1 USDC/USDT returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("USDT nrOfDecimals: ", parseInt(nrOfDecimals));

    const oraclePriceEthUsdc = await getPriceFromOracle(
      network.config.oracles[USDC_ADDRESS][ETH_ADDRESS]
    );

    const oraclePriceUsdtEth = await getPriceFromOracle(
      network.config.oracles[USDT_ADDRESS][ETH_ADDRESS]
    );

    const desiredReturnAmount = oraclePriceEthUsdc / oraclePriceUsdtEth;

    console.log(`1 USDC is worth ${desiredReturnAmount} USDT`);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
    expect(nrOfDecimals).to.be.equal(6);
  });

  it("should geth expected return amount of WETH/X", async () => {
    const oneEth = ethers.utils.parseEther("1");
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(
      oneEth.toString(),
      WETH_ADDRESS,
      ETH_ADDRESS
    );

    console.log(
      "\n\n1 WETH/ETH returnAmount: ",
      returnAmount / Math.pow(10, parseInt(nrOfDecimals))
    );
    console.log("ETH nrOfDecimals: ", parseInt(nrOfDecimals));
    expect(returnAmount / Math.pow(10, nrOfDecimals)).to.be.equal(1);
    expect(nrOfDecimals).to.be.equal(18);
  });

  it("Owner cannot update existing oracles", async () => {
    // check that we already listed a particular oracle address
    // AAVE <> ETH
    const oracleAddress = await contract.tokenPairAddress(
      AAVE_ADDRESS,
      ETH_ADDRESS
    );

    expect(oracleAddress).to.not.be.equal(ethers.constants.AddressZero);

    // Check that Owner cannot update existing oracles
    await expect(
      contract.addTokens(
        [AAVE_ADDRESS],
        [ETH_ADDRESS],
        // Random Address
        [UNI_ADDRESS]
      )
    ).to.be.revertedWith(
      "VM Exception while processing transaction: revert OracleAggregator: Cannot update existing oracles"
    );
  });
});
