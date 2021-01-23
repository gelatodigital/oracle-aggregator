const { ethers, network } = require("hardhat");

const ETH_ADDRESS = network.config.addresses.ethAddress;
const USD_ADDRESS = network.config.addresses.usdAddress;

module.exports.getAggregatedOraclesV2 = () => {
  let oracleTokens;

  if (network.name == "hardhat" || network.name == "mainnet") {
    oracleTokens = Object.values(network.config.addresses);
  } else {
    throw Error(`unsupported network ${network.name}`);
  }

  let tokensA = [];
  let tokensB = [];
  let oracles = [];
  for (let i = 0; i < oracleTokens.length; i++) {
    if (oracleTokens[i] == network.config.addresses.wethAddress) {
      continue;
    }
    if (
      network.config.oracles[oracleTokens[i]][
        network.config.addresses.ethAddress
      ]
    ) {
      tokensA.push(oracleTokens[i]);
      tokensB.push(network.config.addresses.ethAddress);
      oracles.push(
        network.config.oracles[oracleTokens[i]][
          network.config.addresses.ethAddress
        ]
      );
    }

    if (
      network.config.oracles[oracleTokens[i]][
        network.config.addresses.usdAddress
      ]
    ) {
      tokensA.push(oracleTokens[i]);
      tokensB.push(network.config.addresses.usdAddress);
      oracles.push(
        network.config.oracles[oracleTokens[i]][
          network.config.addresses.usdAddress
        ]
      );
    }
  }

  return { tokensA, tokensB, oracles };
};

module.exports.getAggregatedOraclesV1 = () => {
  let stablecoins;
  let decimals;
  let oracleTokens;

  if (network.name == "hardhat" || network.name == "mainnet") {
    stablecoins = [
      network.config.addresses.usdAddress,
      network.config.addresses.usdcAddress,
      network.config.addresses.usdtAddress,
      network.config.addresses.daiAddress,
      network.config.addresses.busdAddress,
      network.config.addresses.susdAddress,
      network.config.addresses.tusdAddress,
    ];

    decimals = [8, 6, 6, 18, 18, 18, 18];

    oracleTokens = [
      network.config.addresses.usdAddress,
      network.config.addresses.ethAddress,
      network.config.addresses.aaveAddress,
      network.config.addresses.adxAddress,
      network.config.addresses.batAddress,
      network.config.addresses.bnbAddress,
      network.config.addresses.bntAddress,
      network.config.addresses.bzrxAddress,
      network.config.addresses.compAddress,
      network.config.addresses.croAddress,
      network.config.addresses.dmgAddress,
      network.config.addresses.enjAddress,
      network.config.addresses.kncAddress,
      network.config.addresses.linkAddress,
      network.config.addresses.lrcAddress,
      network.config.addresses.manaAddress,
      network.config.addresses.mkrAddress,
      network.config.addresses.nmrAddress,
      network.config.addresses.renAddress,
      network.config.addresses.repAddress,
      network.config.addresses.snxAddress,
      network.config.addresses.sxpAddress,
      network.config.addresses.uniAddress,
      network.config.addresses.womAddress,
      network.config.addresses.yfiAddress,
      network.config.addresses.zrxAddress,
    ];
  } else if (network.name == "rinkeby") {
    stablecoins = [
      network.config.addresses.usdAddress,
      network.config.addresses.usdcAddress,
      network.config.addresses.daiAddress,
    ];

    decimals = [8, 6, 18];

    oracleTokens = [
      network.config.addresses.usdAddress,
      network.config.addresses.ethAddress,
      network.config.addresses.batAddress,
      network.config.addresses.linkAddress,
      network.config.addresses.repAddress,
      network.config.addresses.snxAddress,
      network.config.addresses.zrxAddress,
    ];
  } else {
    throw Error(`unsupported network ${network.name}`);
  }

  let tokensA = [];
  let tokensB = [];
  let oracles = [];
  for (let i = 0; i < oracleTokens.length; i++) {
    if (
      network.config.oracles[oracleTokens[i]][
        network.config.addresses.ethAddress
      ]
    ) {
      tokensA.push(oracleTokens[i]);
      tokensB.push(network.config.addresses.ethAddress);
      oracles.push(
        network.config.oracles[oracleTokens[i]][
          network.config.addresses.ethAddress
        ]
      );
    }

    if (
      network.config.oracles[oracleTokens[i]][
        network.config.addresses.usdAddress
      ]
    ) {
      tokensA.push(oracleTokens[i]);
      tokensB.push(network.config.addresses.usdAddress);
      oracles.push(
        network.config.oracles[oracleTokens[i]][
          network.config.addresses.usdAddress
        ]
      );
    }
  }

  return { tokensA, tokensB, oracles, stablecoins, decimals };
};

module.exports.getAllTestPairs = () => {
  const allAddresses = Object.values(network.config.addresses);
  const checkAddresses = [
    ETH_ADDRESS,
    network.config.addresses.uniAddress,
    network.config.addresses.sxpAddress,
    USD_ADDRESS,
  ];
  let pairs = [];

  // nested loop not efficient but fine while number of tokens remains reasonable
  for (let i = 0; i < checkAddresses.length; i++) {
    for (let j = 0; j < allAddresses.length; j++) {
      pairs.push([allAddresses[j], checkAddresses[i]]);
    }
  }

  return pairs;
};

module.exports.roundToTwo = (num) => {
  return +(Math.round(num + "e+2") + "e-2");
};

const getPriceFromOracle = async (oracleAddress) => {
  const ChainlinkOracle = await ethers.getContractAt(
    "contracts/interfaces/AggregatorV3Interface.sol:AggregatorV3Interface",
    oracleAddress
  );

  const oracleData = await ChainlinkOracle.latestRoundData();
  const oracleDecimals = await ChainlinkOracle.decimals();
  const oraclePrice =
    parseInt(oracleData.answer) / Math.pow(10, parseInt(oracleDecimals));

  return oraclePrice;
};

module.exports.getPriceFromOracle = getPriceFromOracle;

module.exports.computeChainlinkPrice = async (inToken, outToken) => {
  if (inToken == network.config.addresses.wethAddress) {
    inToken = ETH_ADDRESS;
  }
  if (outToken == network.config.addresses.wethAddress) {
    outToken = ETH_ADDRESS;
  }
  if (network.config.oracles[inToken][outToken]) {
    return await getPriceFromOracle(network.config.oracles[inToken][outToken]);
  } else if (network.config.oracles[outToken][inToken]) {
    return (
      1 / (await getPriceFromOracle(network.config.oracles[outToken][inToken]))
    );
  }
  if (
    network.config.oracles[inToken][ETH_ADDRESS] &&
    network.config.oracles[outToken][ETH_ADDRESS]
  ) {
    let inEth = await getPriceFromOracle(
      network.config.oracles[inToken][ETH_ADDRESS]
    );
    let outEth = await getPriceFromOracle(
      network.config.oracles[outToken][ETH_ADDRESS]
    );
    return inEth / outEth;
  } else if (
    network.config.oracles[inToken][USD_ADDRESS] &&
    network.config.oracles[outToken][USD_ADDRESS]
  ) {
    let inUsd = await getPriceFromOracle(
      network.config.oracles[inToken][USD_ADDRESS]
    );
    let outUsd = await getPriceFromOracle(
      network.config.oracles[outToken][USD_ADDRESS]
    );
    return inUsd / outUsd;
  } else if (
    network.config.oracles[inToken][USD_ADDRESS] &&
    network.config.oracles[outToken][ETH_ADDRESS]
  ) {
    let inUsd = await getPriceFromOracle(
      network.config.oracles[inToken][USD_ADDRESS]
    );
    let outEth = await getPriceFromOracle(
      network.config.oracles[outToken][ETH_ADDRESS]
    );
    let ethUsd = await getPriceFromOracle(
      network.config.oracles[ETH_ADDRESS][USD_ADDRESS]
    );
    let outUsd = ethUsd * outEth;
    return inUsd / outUsd;
  } else if (
    network.config.oracles[outToken][USD_ADDRESS] &&
    network.config.oracles[inToken][ETH_ADDRESS]
  ) {
    let outUsd = await getPriceFromOracle(
      network.config.oracles[outToken][USD_ADDRESS]
    );
    let inEth = await getPriceFromOracle(
      network.config.oracles[inToken][ETH_ADDRESS]
    );
    let ethUsd = await getPriceFromOracle(
      network.config.oracles[ETH_ADDRESS][USD_ADDRESS]
    );
    let inUsd = inEth * ethUsd;
    return inUsd / outUsd;
  }

  throw Error("no route found");
};

let symbols = {};
symbols[ETH_ADDRESS] = "ETH";
symbols[USD_ADDRESS] = "USD";
symbols[network.config.addresses.aaveAddress] = "AAVE";
symbols[network.config.addresses.adxAddress] = "ADX";
symbols[network.config.addresses.balAddress] = "BAL";
symbols[network.config.addresses.batAddress] = "BAT";
symbols[network.config.addresses.bnbAddress] = "BNB";
symbols[network.config.addresses.bntAddress] = "BNT";
symbols[network.config.addresses.busdAddress] = "BUSD";
symbols[network.config.addresses.bzrxAddress] = "BZRX";
symbols[network.config.addresses.compAddress] = "COMP";
symbols[network.config.addresses.croAddress] = "CRO";
symbols[network.config.addresses.daiAddress] = "DAI";
symbols[network.config.addresses.dmgAddress] = "DMG";
symbols[network.config.addresses.enjAddress] = "ENJ";
symbols[network.config.addresses.kncAddress] = "KNC";
symbols[network.config.addresses.linkAddress] = "LINK";
symbols[network.config.addresses.lrcAddress] = "LRC";
symbols[network.config.addresses.manaAddress] = "MANA";
symbols[network.config.addresses.mkrAddress] = "MKR";
symbols[network.config.addresses.manaAddress] = "MANA";
symbols[network.config.addresses.nmrAddress] = "NMR";
symbols[network.config.addresses.renAddress] = "REN";
symbols[network.config.addresses.repAddress] = "REP";
symbols[network.config.addresses.snxAddress] = "SNX";
symbols[network.config.addresses.susdAddress] = "SUSD";
symbols[network.config.addresses.sxpAddress] = "SXP";
symbols[network.config.addresses.tusdAddress] = "TUSD";
symbols[network.config.addresses.uniAddress] = "UNI";
symbols[network.config.addresses.usdcAddress] = "USDC";
symbols[network.config.addresses.usdkAddress] = "USDK";
symbols[network.config.addresses.usdtAddress] = "USDT";
symbols[network.config.addresses.wbtcAddress] = "WBTC";
symbols[network.config.addresses.womAddress] = "WOM";
symbols[network.config.addresses.wethAddress] = "WETH";
symbols[network.config.addresses.yfiAddress] = "YFI";
symbols[network.config.addresses.zrxAddress] = "ZRX";

module.exports.symbols = symbols;
