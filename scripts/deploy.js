async function main() {
    
    const [deployer] = await ethers.getSigners();
    
    console.log(
      "Deploying contracts with the account:",
      deployer.address
    );
    
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const { tokensA, tokensB, oracles, stablecoins, decimals } = getAggregatedOracles();
    contract = await GelatoOracleAggregator.deploy(
      WETH_ADDRESS,
      tokensA,
      tokensB,
      oracles,
      stablecoins,
      decimals,
    );
  
    console.log("Contract address:", contract.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });