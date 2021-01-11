const { ethers, network } = require('hardhat');
const readline = require("readline");
const { expect } = require("chai");
const { getAggregatedOracles } = require('./helper');
const ChainlinkOracleAbi = require("../artifacts/@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol/AggregatorV3Interface.json")
  .abi;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function roundToTwo(num) {    
    return +(Math.round(num + "e+2")  + "e-2");
}

async function getPriceFromOracle(oracleAddress){
  const ChainlinkOracle = await ethers.getContractAt(
    ChainlinkOracleAbi,
    oracleAddress
  );

  const oracleData = await ChainlinkOracle.latestRoundData();
  const oracleDecimals = await ChainlinkOracle.decimals();
  const oraclePrice =
    parseInt(oracleData.answer) / Math.pow(10, parseInt(oracleDecimals));

    return oraclePrice;
}

describe('GelatoOracleAggregator TEST', async function(){
    var contract, returnAmount, nrOfDecimals;
    const ETH_ADDRESS = network.config.addresses.ethAddress;
    const USD_ADDRESS = network.config.addresses.usdAddress;
    const BUSD_ADDRESS = network.config.addresses.busdAddress;
    const USDC_ADDRESS = network.config.addresses.usdcAddress;
    const KNC_ADDRESS = network.config.addresses.kncAddress;
    const UNI_ADDRESS = network.config.addresses.uniAddress;
    const SXP_ADDRESS = network.config.addresses.sxpAddress;
    const AAVE_ADDRESS = network.config.addresses.aaveAddress;
    const WETH_ADDRESS = network.config.addresses.wethAddress;


    this.timeout(0);


    before(async function(){
        [deployer, user] = await ethers.getSigners();

       
        const GelatoOracleAggregator = await ethers.getContractFactory("OracleAggregator");
        const { tokensA, tokensB, oracles, stablecoins, decimals } = getAggregatedOracles();
        contract = await GelatoOracleAggregator.deploy(
          WETH_ADDRESS,
          tokensA,
          tokensB,
          oracles,
          stablecoins,
          decimals,
        );
        console.log('❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆');
        console.log("🔵Contract address:", contract.address);
    })

    // test inToken ETH, outToken Stablecoin
    // using oracle ETH vs USD
    it("should get expected return amount and nrOfDecimals of ETH/USDC", async () => {
      const oneEth = ethers.utils.parseEther('1');
      [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(oneEth.toString(), ETH_ADDRESS, USDC_ADDRESS)
  
      console.log("\n\nETH/USDC returnAmount: ", returnAmount / Math.pow(10,parseInt(nrOfDecimals)));
      console.log("ETH/USDC nrOfDecimals: ", parseInt(nrOfDecimals));
  
      const oraclePriceEthUsd = await
        getPriceFromOracle(network.config.oracles[ETH_ADDRESS][USD_ADDRESS]);
  
      // Desired Return Amount
      const desiredReturnAmount = oraclePriceEthUsd;
  
      console.log(`1 ETH is worth ${desiredReturnAmount} USDC`);
  
      expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
        roundToTwo(desiredReturnAmount)
      );
      expect(nrOfDecimals).to.be.equal(6);
    })

    // test inToken Stablecoin, outToken ETH
    // using oracle USD vs ETH
    it("should get expected return amount and nrOfDecimals of USDC/ETH", async () => {
      const oneUsdc = 10 ** 6;
      [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(oneUsdc.toString(), USDC_ADDRESS, ETH_ADDRESS)
  
      console.log("\n\nUSDC/ETH returnAmount: ", returnAmount / Math.pow(10,parseInt(nrOfDecimals)));
      console.log("ETH nrOfDecimals: ", parseInt(nrOfDecimals));
  
      const oraclePriceUsdEth = await
        getPriceFromOracle(network.config.oracles[USD_ADDRESS][ETH_ADDRESS]);
  
      // Desired Return Amount
      const desiredReturnAmount = oraclePriceUsdEth;
  
      console.log(`1 USDC is worth ${desiredReturnAmount} ETH`);
  
      expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
        roundToTwo(desiredReturnAmount)
      );
      expect(nrOfDecimals).to.be.equal(18);
    })

    // test inToken and outToken are both Stablecoins
    // using oracle USD vs ETH (twice)
    it('should get expected return amount and nrOfDecimals of USDC/BUSD', async() => {
      const oneUsdc = 10 ** 6;
      [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(oneUsdc.toString(), USDC_ADDRESS, BUSD_ADDRESS)

      console.log("\n\nUSDC/BUSD returnAmount: ", returnAmount / Math.pow(10,parseInt(nrOfDecimals)));
      console.log("BUSD nrOfDecimals: ", parseInt(nrOfDecimals));

      expect(returnAmount / Math.pow(10, parseInt(nrOfDecimals)))
        .to.be.equal(1);

      expect(nrOfDecimals).to.be.equal(18);
    })

    // test outToken is Stablecoin, but no direct oracle with inToken
    // using oracles UNI vs ETH and USD vs ETH
    it("should get expected return amount and nrOfDecimals of UNI/USDC", async () => {
      const oneUni = ethers.utils.parseEther('1');
      [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(oneUni.toString(), UNI_ADDRESS, USDC_ADDRESS)
  
      console.log("\n\nUNI/USDC returnAmount: ", returnAmount / Math.pow(10,parseInt(nrOfDecimals)));
      console.log("USDC nrOfDecimals: ", parseInt(nrOfDecimals));

      const oraclePriceUniEth = await
        getPriceFromOracle(network.config.oracles[UNI_ADDRESS][ETH_ADDRESS]);
  
      const oraclePriceUsdEth = await
        getPriceFromOracle(network.config.oracles[USD_ADDRESS][ETH_ADDRESS]);
  
      // Desired Return Amount
      const desiredReturnAmount = oraclePriceUniEth / oraclePriceUsdEth;
  
      console.log(`1 UNI is worth ${desiredReturnAmount} USDC`);
  
      expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
        roundToTwo(desiredReturnAmount)
      );
      expect(nrOfDecimals).to.be.equal(6);
    })

    // test outToken is ETH, but no direct oracle with inToken
    // using oracles SXP vs USD and ETH vs USD
    it("should get expected return amount and nrOfDecimals of SXP/ETH", async () => {
      const oneSxp = ethers.utils.parseEther('1');
      [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(oneSxp.toString(), SXP_ADDRESS, ETH_ADDRESS)
  
      console.log("\n\nSXP/ETH returnAmount: ", returnAmount / Math.pow(10,parseInt(nrOfDecimals)));
      console.log("ETH nrOfDecimals: ", parseInt(nrOfDecimals));

      const oraclePriceSxpUsd = await
        getPriceFromOracle(network.config.oracles[SXP_ADDRESS][USD_ADDRESS]);
  
      const oraclePriceEthUsd = await
        getPriceFromOracle(network.config.oracles[ETH_ADDRESS][USD_ADDRESS]);
  
      // Desired Return Amount
      const desiredReturnAmount = oraclePriceSxpUsd / oraclePriceEthUsd;
  
      console.log(`1 SXP is worth ${desiredReturnAmount} ETH`);
  
      expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
        roundToTwo(desiredReturnAmount)
      );
      expect(nrOfDecimals).to.be.equal(18);
    })

    // test neither token ETH or Stablecoin, both tokens have an oracle with ETH
    // using oracles KNC vs ETH and UNI vs ETH
    it('should get expected return amount of KNC/UNI', async() => {
      const oneKnc = ethers.utils.parseEther('1');
      [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(oneKnc.toString(), KNC_ADDRESS, UNI_ADDRESS)
  
      console.log("\n\nKNC/UNI returnAmount: ", returnAmount / Math.pow(10,parseInt(nrOfDecimals)));
      console.log("UNI nrOfDecimals: ", parseInt(nrOfDecimals));
  
      const oraclePriceKncEth = await
        getPriceFromOracle(network.config.oracles[KNC_ADDRESS][ETH_ADDRESS]);
  
      const oraclePriceUniEth = await
        getPriceFromOracle(network.config.oracles[UNI_ADDRESS][ETH_ADDRESS]);
  
      // Desired Return Amount
      const desiredReturnAmount = oraclePriceKncEth / oraclePriceUniEth;
  
      console.log(`1 KNC is worth ${desiredReturnAmount} UNI`);
  
      expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
        roundToTwo(desiredReturnAmount)
      );
      expect(nrOfDecimals).to.be.equal(18);
    })

    // test neither token ETH or Stablecoin, one token has oracle vs ETH while other vs USD
    // using oracles UNI vs ETH, SXP vs USD, and ETH vs USD
    it('should get expected return amount of UNI/SXP', async() => {
      const oneUni = ethers.utils.parseEther('1');
      [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(oneUni.toString(), UNI_ADDRESS, SXP_ADDRESS)
  
      console.log("\n\nUNI/SXP returnAmount: ", returnAmount / Math.pow(10,parseInt(nrOfDecimals)));
      console.log("SXP nrOfDecimals: ", parseInt(nrOfDecimals));
  
      const oraclePriceUniEth = await
        getPriceFromOracle(network.config.oracles[UNI_ADDRESS][ETH_ADDRESS]);
  
      const oraclePriceSxpUsd = await
        getPriceFromOracle(network.config.oracles[SXP_ADDRESS][USD_ADDRESS]);

      const oraclePriceEthUsd = await
        getPriceFromOracle(network.config.oracles[ETH_ADDRESS][USD_ADDRESS]);
  
  
      // Desired Return Amount
      const desiredReturnAmount = oraclePriceUniEth * oraclePriceEthUsd / oraclePriceSxpUsd;
  
      console.log(`1 UNI is worth ${desiredReturnAmount} SXP`);
  
      expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
        roundToTwo(desiredReturnAmount)
      );
      expect(nrOfDecimals).to.be.equal(18);
    })

    // test neither token ETH or Stablecoin, one token has oracle vs ETH while other vs USD
    // using oracles UNI vs ETH, SXP vs USD, and ETH vs USD
    it('should get expected return amount of SXP/UNI', async() => {
      const oneSxp = ethers.utils.parseEther('1');
      [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(oneSxp.toString(), SXP_ADDRESS, UNI_ADDRESS)
  
      console.log("\n\nSXP/UNI returnAmount: ", returnAmount / Math.pow(10,parseInt(nrOfDecimals)));
      console.log("UNI nrOfDecimals: ", parseInt(nrOfDecimals));
  
      const oraclePriceUniEth = await
        getPriceFromOracle(network.config.oracles[UNI_ADDRESS][ETH_ADDRESS]);
  
      const oraclePriceSxpUsd = await
        getPriceFromOracle(network.config.oracles[SXP_ADDRESS][USD_ADDRESS]);

      const oraclePriceUsdEth = await
        getPriceFromOracle(network.config.oracles[USD_ADDRESS][ETH_ADDRESS]);
  
      // Desired Return Amount
      const desiredReturnAmount = oraclePriceSxpUsd * oraclePriceUsdEth / oraclePriceUniEth;
  
      console.log(`1 SXP is worth ${desiredReturnAmount} UNI`);
  
      expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
        roundToTwo(desiredReturnAmount)
      );
      expect(nrOfDecimals).to.be.equal(18);
    })

    // test inToken generic USD address
    it('should get expected return amount of USD/AAVE', async() => {
      const oneDollar = 10 ** 8;
      [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(oneDollar.toString(), USD_ADDRESS, AAVE_ADDRESS)
  
      console.log("\n\nUSD/AAVE returnAmount: ", returnAmount / Math.pow(10,parseInt(nrOfDecimals)));
      console.log("AAVE nrOfDecimals: ", parseInt(nrOfDecimals));
  
      const oraclePriceAaveEth = await
        getPriceFromOracle(network.config.oracles[AAVE_ADDRESS][ETH_ADDRESS]);

      const oraclePriceUsdEth = await
        getPriceFromOracle(network.config.oracles[USD_ADDRESS][ETH_ADDRESS]);
  
      // Desired Return Amount
      const desiredReturnAmount = oraclePriceUsdEth / oraclePriceAaveEth;
  
      console.log(`1 USD is worth ${desiredReturnAmount} AAVE`);
  
      expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
        roundToTwo(desiredReturnAmount)
      );
      expect(nrOfDecimals).to.be.equal(18);
    })

    // test outToken generic USD address
    it('should get expected return amount of AAVE/USD', async() => {
      const oneAave = ethers.utils.parseEther('1');
      [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(oneAave.toString(), AAVE_ADDRESS, USD_ADDRESS)
  
      console.log("\n\nAAVE/USD returnAmount: ", returnAmount / Math.pow(10,parseInt(nrOfDecimals)));
      console.log("USD/UNI nrOfDecimals: ", parseInt(nrOfDecimals));
  
      const oraclePriceAaveEth = await
        getPriceFromOracle(network.config.oracles[AAVE_ADDRESS][ETH_ADDRESS]);

      const oraclePriceUsdEth = await
        getPriceFromOracle(network.config.oracles[USD_ADDRESS][ETH_ADDRESS]);
  
      // Desired Return Amount
      const desiredReturnAmount = oraclePriceAaveEth / oraclePriceUsdEth;
  
      console.log(`1 USD is worth ${desiredReturnAmount} AAVE`);
  
      expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
        roundToTwo(desiredReturnAmount)
      );
      expect(nrOfDecimals).to.be.equal(8);
    })
})

