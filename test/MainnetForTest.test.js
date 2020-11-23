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


describe('GelatoOracleAggregator TEST', async function(){
    var contract;
    const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    const USD_ADDRESS = '0x7354C81fbCb229187480c4f497F945C6A312d5C3';
    const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    const KNC_ADDRESS = '0xdd974D5C2e2928deA5F71b9825b8b646686BD200';
    const UNI_ADDRESS = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
    const WBTC_ADDRESS = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
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


  it("should get expected return amount of USDC/AAVE", async () => {
    const sellAmount = ethers.utils.parseUnits("1", "6");
    var res = await contract.getExpectedReturnAmount(
      sellAmount,
      USDC_ADDRESS,
      AAVE_ADDRESS
    );
    var tx = await res.wait();
    var events = await tx.events.pop();

    var returnAmount = await parseInt(events.args.returnAmount);
    var nrOfDecimals = await parseInt(events.args.nrOfDecimals);

    console.log("returnAmount: ", returnAmount / Math.pow(10, nrOfDecimals));

    const aaveEthChainlinkOracle = await ethers.getContractAt(
      ChainlinkOracleAbi,
      "0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012"
    );

    const usdEthChainlinkOracle = await ethers.getContractAt(
      ChainlinkOracleAbi,
      "0x986b5E1e1755e3C2440e960477f25201B0a8bbD4"
    );

    const oracleDataAave = await aaveEthChainlinkOracle.latestRoundData();
    const oracleDecimalsAave = await aaveEthChainlinkOracle.decimals();
    const oraclePriceAaveEth =
      parseInt(oracleDataAave.answer) / Math.pow(10, parseInt(oracleDecimalsAave));

    console.log('oraclePriceAaveEth: ', oraclePriceAaveEth);

    const oracleDataEth = await usdEthChainlinkOracle.latestRoundData();
    const oracleDecimalsEth = await usdEthChainlinkOracle.decimals();
    const oraclePriceUsdEth =
      parseInt(oracleDataEth.answer) / Math.pow(10, parseInt(oracleDecimalsEth));

    console.log('oraclePriceUsdEth: ', oraclePriceUsdEth);

    // Desired Return Amount
    const desiredReturnAmount =
      parseInt(sellAmount) * (oraclePriceUsdEth / oraclePriceAaveEth);

    // Exchange Rate confirmed via CoinGecko
    console.log(`1 USDC is worth ${oraclePriceAaveEth / oraclePriceUsdEth} AAVE`);
    console.log("desiredReturnAmount: ", desiredReturnAmount);

    expect(roundToTwo(returnAmount / Math.pow(10, nrOfDecimals))).to.be.equal(
      roundToTwo(desiredReturnAmount)
    );
  })
    
    it('should add new WBTC/USD token pair', async()=> {
        await contract.addToken(WBTC_ADDRESS,USD_ADDRESS,'0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c');

        const res = await contract.getExpectedReturnAmount(25, WBTC_ADDRESS, USD_ADDRESS);
        const tx = await res.wait();
        const events = await tx.events.pop();

        const returnAmount = await parseInt(events.args.returnAmount);
        const nrOfDecimals = await parseInt(events.args.nrOfDecimals);

        console.log('returnAmount: ', returnAmount / Math.pow(10, nrOfDecimals));

        expect(returnAmount).to.not.be.null;

    })

    it('should be reverted when trying to add new WBTC/ETH token pair (not owner)', async()=> {
        const contractSingner = contract.connect(user)
        await expect(
            contractSingner.addToken(WBTC_ADDRESS,ETH_ADDRESS,'0xdeb288F737066589598e9214E782fa5A8eD689e8')
        ).to.be.reverted;
        
    })

  
    it('should be reverted when input has two same tokens', async() => {
        await expect(
            contract.getExpectedReturnAmount(25, KNC_ADDRESS, KNC_ADDRESS)
        ).to.be.reverted;
    })

    it('should be reverted when input has two usd tokens', async() => {
        await expect(
            contract.getExpectedReturnAmount(25, USD_ADDRESS, USDC_ADDRESS)
        ).to.be.reverted;
    })

    it('should get expected return amount of KNC/ETH', async() => {
        const res = await contract.getExpectedReturnAmount(25, KNC_ADDRESS, ETH_ADDRESS);
        const tx = await res.wait();
        const events = await tx.events.pop();

        const returnAmount = await parseInt(events.args.returnAmount);
        const nrOfDecimals = await parseInt(events.args.nrOfDecimals);

        console.log('returnAmount: ', returnAmount / Math.pow(10, nrOfDecimals));

        expect( roundToTwo( returnAmount / Math.pow(10, nrOfDecimals)))
        .to.be.equal
        (0.05);
    })

    it('should get expected return amount of UNI/USD', async() => {
        const res = await contract.getExpectedReturnAmount(25, UNI_ADDRESS, USD_ADDRESS);
        const tx = await res.wait();
        const events = await tx.events.pop();

        const returnAmount = await parseInt(events.args.returnAmount);
        const nrOfDecimals = await parseInt(events.args.nrOfDecimals);

        console.log('returnAmount: ', returnAmount / Math.pow(10, nrOfDecimals));

        expect( roundToTwo( returnAmount / Math.pow(10, nrOfDecimals)))
        .to.be.equal
        (53.61);
    })

    it('should get expected return amount of KNC/UNI', async() => {
        const res = await contract.getExpectedReturnAmount(25, KNC_ADDRESS, UNI_ADDRESS);
        const tx = await res.wait();
        const events = await tx.events.pop();

        const returnAmount = await parseInt(events.args.returnAmount);
        const nrOfDecimals = await parseInt(events.args.nrOfDecimals);

        console.log('returnAmount: ', returnAmount / Math.pow(10, nrOfDecimals));

        expect( roundToTwo( returnAmount / Math.pow(10, nrOfDecimals)))
        .to.be.equal
        (8.60);
    })

    it('should get expected return amount of UNI/SXP', async() => {
        const res = await contract.getExpectedReturnAmount(25, UNI_ADDRESS, SXP_ADDRESS);
        const tx = await res.wait();
        const events = await tx.events.pop();

        const returnAmount = await parseInt(events.args.returnAmount);
        const nrOfDecimals = await parseInt(events.args.nrOfDecimals);

        console.log('returnAmount: ', returnAmount / Math.pow(10, nrOfDecimals));

        expect( roundToTwo( returnAmount / Math.pow(10, nrOfDecimals)))
        .to.be.equal
        (69.87);
    })

    it('should get expected return amount of SXP/UNI', async() => {
        const res = await contract.getExpectedReturnAmount(25, SXP_ADDRESS, UNI_ADDRESS);
        const tx = await res.wait();
        const events = await tx.events.pop();

        const returnAmount = await parseInt(events.args.returnAmount);
        const nrOfDecimals = await parseInt(events.args.nrOfDecimals);

        console.log('returnAmount: ', returnAmount / Math.pow(10, nrOfDecimals));

        expect( roundToTwo( returnAmount / Math.pow(10, nrOfDecimals)))
        .to.be.equal
        (8.95);
    })

    it('should be reverted when input has invalid token address', async() => {
        await expect( 
            contract.getExpectedReturnAmount(1, '0x8CE9137d39326AD0cD6491fb5CC0CbA0e089b6A8', KNC_ADDRESS)
        ).to.be.reverted
    })

   
})


// describe('GelatoOracleAggregator DEMO', async function() {

//     var contract;
//     var amount; 
//     var addressToken_A; 
//     var addressToken_B;
//     var tokenPairPrice;
//     const amount_tenToPower = 5;

//     this.timeout(0);


//     before(async function(){
//         const [deployer] = await ethers.getSigners();
         
//         const GelatoOracleAggregator = await ethers.getContractFactory("GelatoOracleAggregator");
//         contract = await GelatoOracleAggregator.deploy();
    
//         console.log('❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆');
//         console.log("🔵Contract address:", contract.address);

//     })


//    it('Get token amount and token tickers', function(done){
//     console.log('\n')
//     console.log('🌟Calculate your return amount of tokenA/tokenB')
//     console.log('🟥 Make sure to enter checksum token address');
//     console.log('🟥 AMOUNT SHOULD NOT HAVE MORE THAN 5 DECIMAL PLACES ','\n');

//     rl.question("Amount: ", function(_amount) {
//         rl.question("Address of Token A: ", function(tokenA) {
//             rl.question("Address of Token B: ", function(tokenB) {
//             console.log(`
//             Amount: ${_amount}
//             Address of TokenA: ${tokenA}
//             Address of TokenB: ${tokenB}
//             `);

//             if(_amount < 0.00001 || tokenA === ""|| tokenB === ""){
//                 console.log('🟥 INVALID INPUTS');
//                 process.exit(1);
//             }

//             amount =  _amount * Math.pow(10, amount_tenToPower);
//             addressToken_A =  tokenA;
//             addressToken_B =  tokenB; 

//             done();
//             });
//         });
//     });


//    })

//     it('Get return amount between token pairs', async() => {

        
//         try{ 
//             var res = await contract.getExpectedReturnAmount(amount, addressToken_A, addressToken_B);
//             var tx = await res.wait();
//             var events = await tx.events.pop();

//             const _returnAmount = await parseInt(events.args.returnAmount);
//             const _nrOfDecimals = await parseInt(events.args.nrOfDecimals);

//             var nrOfDecimals = _nrOfDecimals + amount_tenToPower;
//             var returnAmount = _returnAmount / (Math.pow(10, nrOfDecimals));        
                
//             console.log(`🌟Return Amount of tokenA/tokenB with an amount of ${amount/Math.pow(10,amount_tenToPower)}: `  + returnAmount);
//         } catch(err) {
//             console.log('🟥',err.message);
//             process.exit(1);
//         }

//     })

  
// })



