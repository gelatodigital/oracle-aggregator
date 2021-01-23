const { ethers, deployments, network } = require("hardhat");
const { expect } = require("chai");
const { computeChainlinkPrice, getAllTestPairs, symbols } = require("./helper");

const ETH_ADDRESS = network.config.addresses.ethAddress;
const USD_ADDRESS = network.config.addresses.usdAddress;

describe("OracleAggregator V2 TEST", async function () {
  let contract;

  this.timeout(0);

  before(async function () {
    await deployments.fixture();
    contract = await ethers.getContract("OracleAggregator");
    console.log("❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆❆");
    console.log("🔵Contract address:", contract.address);
  });

  const checkPair = async (amountIn, tokenIn, tokenOut) => {
    let decimalsIn;
    let decimalsOut;
    if (tokenIn !== ETH_ADDRESS && tokenIn !== USD_ADDRESS) {
      decimalsIn = await (
        await ethers.getContractAt("ERC20", tokenIn)
      ).decimals();
    } else {
      decimalsIn = tokenIn == ETH_ADDRESS ? 18 : 8;
    }
    if (tokenOut !== ETH_ADDRESS && tokenOut !== USD_ADDRESS) {
      decimalsOut = await (
        await ethers.getContractAt("ERC20", tokenOut)
      ).decimals();
    } else {
      decimalsOut = tokenOut == ETH_ADDRESS ? 18 : 8;
    }

    let [returnAmount, returnDecimals] = await contract.getExpectedReturnAmount(
      ethers.utils.parseUnits(amountIn.toString(), decimalsIn),
      tokenIn,
      tokenOut
    );
    console.log(
      `    ${amountIn} ${symbols[tokenIn]} returns ${
        returnAmount / Math.pow(10, parseInt(returnDecimals))
      } ${symbols[tokenOut]}`
    );

    const oraclePrice = await computeChainlinkPrice(tokenIn, tokenOut);

    console.log(
      `    ${amountIn} ${symbols[tokenIn]} is worth ${oraclePrice * amountIn} ${
        symbols[tokenOut]
      }\n`
    );

    expect(
      returnAmount / Math.pow(10, returnDecimals) - oraclePrice * amountIn
    ).to.be.lt((oraclePrice * amountIn) / 1000);
    expect(returnDecimals).to.be.equal(decimalsOut);
  };

  it(`Test all token pairs`, async () => {
    let pairs = getAllTestPairs();
    for (let i = 0; i < pairs.length; i++) {
      let [tokenIn, tokenOut] = pairs[i];
      let amounts = [1, 25, 0.25];
      console.log(
        `    -------------------${symbols[tokenIn]} ${symbols[tokenOut]}---------------\n`
      );
      for (let j = 0; j < amounts.length; j++) {
        await checkPair(amounts[j], tokenIn, tokenOut);
      }
      console.log(`    -----------------------------------------`);
    }
  });

  it("Unknown tokens should return 0", async () => {
    // Check that Owner cannot update existing oracles
    const randomAddress =
      network.config.oracles[network.config.addresses.ethAddress][
        network.config.addresses.usdAddress
      ];
    const [returnAmount] = await contract.getExpectedReturnAmount(
      ethers.utils.parseEther("1"),
      network.config.addresses.ethAddress,
      randomAddress
    );
    expect(returnAmount).to.be.eq(0);
  });

  it("Revert if input is 0", async () => {
    // Check that Owner cannot update existing oracles
    await expect(
      contract.getExpectedReturnAmount(
        0,
        network.config.addresses.ethAddress,
        network.config.addresses.usdAddress
      )
    ).to.be.revertedWith("OracleAggregator: amountIn is Zero");
  });

  it("Revert if input address is 0", async () => {
    // Check that Owner cannot update existing oracles
    await expect(
      contract.getExpectedReturnAmount(
        ethers.utils.parseEther("1"),
        network.config.addresses.ethAddress,
        ethers.constants.AddressZero
      )
    ).to.be.revertedWith("OracleAggregator: outToken is Zero");
  });

  it("Owner cannot update existing oracles", async () => {
    // check that we already listed a particular oracle address
    // AAVE <> ETH
    const oracleAddress = await contract.tokenPairAddress(
      network.config.addresses.aaveAddress,
      network.config.addresses.ethAddress
    );

    expect(oracleAddress).to.not.be.equal(ethers.constants.AddressZero);

    // Check that Owner cannot update existing oracles
    await expect(
      contract.addTokens(
        [network.config.addresses.aaveAddress],
        [network.config.addresses.ethAddress],
        // Random Address
        [network.config.addresses.uniAddress]
      )
    ).to.be.revertedWith("OracleAggregator: Cannot update oracles");
  });
});
