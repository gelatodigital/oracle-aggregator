const { ethers } = require('hardhat');
const readline = require("readline");
const { expect } = require("chai");



const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

describe('GelatoOracleAggregator TEST', async function(){
    var contract;
    var tokenPairPrice_new;

    this.timeout(0);


    before(async function(){
        const [deployer] = await ethers.getSigners();
         
        const GelatoOracleAggregator = await ethers.getContractFactory("GelatoOracleAggregator");
        contract = await GelatoOracleAggregator.deploy();
        console.log('❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆');
        console.log("🔵Contract address:", contract.address);

    })

    it('should add new WOM/ETH token pair', async()=> {
        await contract.addTokenPair("WOM","ETH",'0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46');
        await contract.updateTokenPairPrice("WOM","ETH");

        const wom_ethContract = await contract.tokenPairAddress("WOM","ETH");
        expect(wom_ethContract).to.equal("0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46");
    })

    it('should update token pair price', async() => {
        const tokenPairPrice_old = 0;
        await contract.updateTokenPairPrice("ETH", "USD");
        tokenPairPrice_new = await contract.tokenPairPrice("ETH", "USD");
        expect(parseInt(tokenPairPrice_new)).to.be.greaterThan(tokenPairPrice_old);
    })

    it('should get correct expected return rate', async() => {
        const amount = 0.5;
       
        const returnRate = await contract.getExpectedReturnRate(amount * 100000 , "ETH", "USD");
        const nrOfDecimals = parseInt(returnRate[1]) + 5
        expect(parseInt(returnRate[0]) / Math.pow(10, nrOfDecimals) ).to.equal( 191.98 )
    })

    it('should revert the transaction for getExpectedReturnRate', async() => {
        const amount = 0.5;
       
        await expect( contract.getExpectedReturnRate(amount , "ETH", "USD")).to.be.reverted;

    })


})

describe('GelatoOracleAggregator DEMO', async function() {

    var contract;
    var amount; 
    var token_A; 
    var token_B;
    var tokenPairPrice;
    const amount_tenToPower = 5;

    this.timeout(0);


    before(async function(){
        const [deployer] = await ethers.getSigners();
         
        const GelatoOracleAggregator = await ethers.getContractFactory("GelatoOracleAggregator");
        contract = await GelatoOracleAggregator.deploy();
    
        console.log('❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆');
        console.log("🔵Contract address:", contract.address);

    })


   it('Get token amount and token tickers', function(done){
    console.log('\n')
    console.log('🌟Calculate your return rate of tokenA/tokenB')
    console.log('🌟See https://docs.chain.link/docs/ethereum-addresses#config for available token pairs');
    console.log('🟥 Make sure to enter ticker in full caps e.g. BTC ');
    console.log('🟥 AMOUNT SHOULD NOT HAVE MORE THAN 5 DECIMAL PLACES ','\n');

    rl.question("Amount: ", function(_amount) {
        rl.question("Token A: ", function(tokenA) {
            rl.question("Token B: ", function(tokenB) {
            console.log(`
            Amount: ${_amount}
            TokenA: ${tokenA}
            TokenB: ${tokenB}
            `);

            if(_amount < 0.00001 || tokenA === ""|| tokenB === ""){
                console.log('🟥 INVALID INPUTS');
                process.exit(1);
            }

            amount =  _amount * Math.pow(10, amount_tenToPower);
            token_A =  tokenA;
            token_B =  tokenB; 

            done();
            });
        });
    });


   })

    it('Get token prices from oracles', async() => {
       
        try{
            console.log('🌟Getting new prices from oracle...');
            await contract.updateTokenPairPrice(token_A, token_B);
            tokenPairPrice = await contract.tokenPairPrice(token_A, token_B);
        }
        catch(err){
            console.log('🟥',err.message);
            process.exit(1);
        }

        // console.log(`${token_A} / ${token_B}: `+tokenPairPrice.toString());
    })

    it('Get return rate between token pairs', async() => {

        
        const res = await contract.getExpectedReturnRate(amount, token_A, token_B);

        var nrOfDecimals = parseInt(res[1].toString()) + amount_tenToPower;
        var returnRate = res[0] / (Math.pow(10, nrOfDecimals));

        console.log(`🌟Current price of token pair ${token_A}/${token_B}: ${tokenPairPrice/ Math.pow(10, res[1])}`);
        
            
        console.log(`🌟Return rate of ${token_A}/${token_B} with an amount of ${amount/Math.pow(10,amount_tenToPower)}: `  + returnRate.toString());
    })

  
})

