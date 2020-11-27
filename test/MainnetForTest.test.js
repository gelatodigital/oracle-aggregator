const { ethers } = require('hardhat');
const readline = require("readline");
const { expect } = require("chai");
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
    const sellAmount = ethers.utils.parseUnits("1", "6");
    const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    const USD_ADDRESS = '0x7354C81fbCb229187480c4f497F945C6A312d5C3';
    const BUSD_ADDRESS = '0x4Fabb145d64652a948d72533023f6E7A623C7C53';
    const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    const KNC_ADDRESS = '0xdd974D5C2e2928deA5F71b9825b8b646686BD200';
    const UNI_ADDRESS = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
    const SXP_ADDRESS = '0x8CE9137d39326AD0cD6491fb5CC0CbA0e089b6A9';
    const AAVE_ADDRESS = "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9";


    this.timeout(0);


    before(async function(){
        [deployer, user] = await ethers.getSigners();

       
        const GelatoOracleAggregator = await ethers.getContractFactory("GelatoOracleAggregator");
        contract = await GelatoOracleAggregator.deploy();
        console.log('❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆');
        console.log("🔵Contract address:", contract.address);
    })

    it("should get expected return amount and nrOfDecimals of USDC/AAVE", async () => {
      [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(sellAmount, USDC_ADDRESS, AAVE_ADDRESS)

      console.log("\n\nUSDC/AAVE returnAmount: ", returnAmount / Math.pow(10,parseInt(nrOfDecimals)));
      console.log("USDC/AAVE nrOfDecimals: ", parseInt(nrOfDecimals));

      const oraclePriceAaveEth = await
        getPriceFromOracle("0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012");

      const oraclePriceUsdEth = await
        getPriceFromOracle("0x986b5E1e1755e3C2440e960477f25201B0a8bbD4");

      // Desired Return Amount
      const desiredReturnAmount =
        parseInt(sellAmount) * (oraclePriceUsdEth / oraclePriceAaveEth);

      console.log(`1 USDC is worth ${oraclePriceAaveEth / oraclePriceUsdEth} AAVE`);
      console.log("desiredReturnAmount: ", desiredReturnAmount);

      expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
        roundToTwo(desiredReturnAmount)
      );
      expect(nrOfDecimals).to.be.equal(18);
    })

// tokenA and tokenB are USD
  it('should get expected return amount and nrOfDecimals of USDC/BUSD', async() => {
    [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(sellAmount, USDC_ADDRESS, BUSD_ADDRESS)

    console.log("\n\nUSDC/BUSD returnAmount: ", returnAmount / Math.pow(10,parseInt(nrOfDecimals)));
    console.log("USDC/BUSD nrOfDecimals: ", parseInt(nrOfDecimals));

    expect(returnAmount / Math.pow(10, parseInt(nrOfDecimals)))
      .to.be.equal(sellAmount);

    expect(nrOfDecimals).to.be.equal(18);
  })

// tokenB is ETH or USD
    // orcale for tokenA/tokenB not available
    it("should get expected return amount and nrOfDecimals of UNI/USDC", async () => {
      [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(sellAmount, UNI_ADDRESS, USDC_ADDRESS)
  
      console.log("\n\nUNI/USDC returnAmount: ", returnAmount / Math.pow(10,parseInt(nrOfDecimals)));
      console.log("UNI/USDC nrOfDecimals: ", parseInt(nrOfDecimals));

      const oraclePriceUniEth = await
        getPriceFromOracle("0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e");
  
      const oraclePriceUsdcEth = await
        getPriceFromOracle("0x986b5E1e1755e3C2440e960477f25201B0a8bbD4");
  
      // Desired Return Amount
      const desiredReturnAmount =
        parseInt(sellAmount) * (oraclePriceUniEth / oraclePriceUsdcEth);
  
      console.log(`1 UNI is worth ${oraclePriceUniEth / oraclePriceUsdcEth} USDC`);
      console.log("desiredReturnAmount: ", desiredReturnAmount);
  
      expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
        roundToTwo(desiredReturnAmount)
      );
      expect(nrOfDecimals).to.be.equal(6);
    })

    //oracle for tokenA/tokenB available
    it("should get expected return amount and nrOfDecimals of ETH/USDC", async () => {
      [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(sellAmount, ETH_ADDRESS, USDC_ADDRESS)
  
      console.log("\n\nETH/USDC returnAmount: ", returnAmount / Math.pow(10,parseInt(nrOfDecimals)));
      console.log("ETH/USDC nrOfDecimals: ", parseInt(nrOfDecimals));
  
      const oraclePriceEthUsd = await
        getPriceFromOracle("0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419");
  
      // Desired Return Amount
      const desiredReturnAmount =
        parseInt(sellAmount) * oraclePriceEthUsd;
  
      console.log(`1 ETH is worth ${oraclePriceEthUsd} USDC`);
      console.log("desiredReturnAmount: ", desiredReturnAmount);
  
      expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
        roundToTwo(desiredReturnAmount)
      );
      expect(nrOfDecimals).to.be.equal(6);
    })

// token B is not ETH or USD
    // using oracles tokenA/USD and tokenB/USD or tokenA/ETH and tokenB/ETH
    it('should get expected return amount of KNC/UNI', async() => {
      [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(sellAmount, KNC_ADDRESS, UNI_ADDRESS)
  
      console.log("\n\nKNC/UNI returnAmount: ", returnAmount / Math.pow(10,parseInt(nrOfDecimals)));
      console.log("KNC/UNI nrOfDecimals: ", parseInt(nrOfDecimals));
  
      const oraclePriceKncEth = await
        getPriceFromOracle("0x656c0544eF4C98A6a98491833A89204Abb045d6b");
  
      const oraclePriceUniEth = await
        getPriceFromOracle("0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e");
  
      // Desired Return Amount
      const desiredReturnAmount =
        parseInt(sellAmount) * ( oraclePriceKncEth / oraclePriceUniEth);
  
      console.log(`1 KNC is worth ${oraclePriceKncEth / oraclePriceUniEth} UNI`);
      console.log("desiredReturnAmount: ", desiredReturnAmount);
  
      expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
        roundToTwo(desiredReturnAmount)
      );
      expect(nrOfDecimals).to.be.equal(18);
    })

    // using oracles tokenA/ETH and tokenB/USD
    it('should get expected return amount of UNI/SXP', async() => {
      [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(sellAmount, UNI_ADDRESS, SXP_ADDRESS)
  
      console.log("\n\nUNI/SXP returnAmount: ", returnAmount / Math.pow(10,parseInt(nrOfDecimals)));
      console.log("UNI/SXP nrOfDecimals: ", parseInt(nrOfDecimals));
  
      const oraclePriceUniEth = await
        getPriceFromOracle("0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e");
  
      const oraclePriceSxpUsd = await
        getPriceFromOracle("0xFb0CfD6c19e25DB4a08D8a204a387cEa48Cc138f");

      const oraclePriceEthUsd = await
        getPriceFromOracle("0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419");
  
  
      // Desired Return Amount
      const desiredReturnAmount =
        parseInt(sellAmount) * ( oraclePriceUniEth * oraclePriceEthUsd / oraclePriceSxpUsd);
  
      console.log(`1 UNI is worth ${oraclePriceUniEth * oraclePriceEthUsd / oraclePriceSxpUsd} SXP`);
      console.log("desiredReturnAmount: ", desiredReturnAmount);
  
      expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
        roundToTwo(desiredReturnAmount)
      );
      expect(nrOfDecimals).to.be.equal(18);
    })

    // using oracles tokenA/USD and tokenB/ETH
    it('should get expected return amount of SXP/UNI', async() => {
      [returnAmount, nrOfDecimals] = await contract.getExpectedReturnAmount(sellAmount, SXP_ADDRESS, UNI_ADDRESS)
  
      console.log("\n\nSXP/UNI returnAmount: ", returnAmount / Math.pow(10,parseInt(nrOfDecimals)));
      console.log("SXP/UNI nrOfDecimals: ", parseInt(nrOfDecimals));
  
      const oraclePriceUniEth = await
        getPriceFromOracle("0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e");
  
      const oraclePriceSxpUsd = await
        getPriceFromOracle("0xFb0CfD6c19e25DB4a08D8a204a387cEa48Cc138f");

      const oraclePriceUsdEth = await
        getPriceFromOracle("0x986b5E1e1755e3C2440e960477f25201B0a8bbD4");
  
      // Desired Return Amount
      const desiredReturnAmount =
        parseInt(sellAmount) * ( oraclePriceSxpUsd * oraclePriceUsdEth / oraclePriceUniEth);
  
      console.log(`1 UNI is worth ${oraclePriceSxpUsd * oraclePriceUsdEth / oraclePriceUniEth} SXP`);
      console.log("desiredReturnAmount: ", desiredReturnAmount);
  
      expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
        roundToTwo(desiredReturnAmount)
      );
      expect(nrOfDecimals).to.be.equal(18);
    })

   
})

