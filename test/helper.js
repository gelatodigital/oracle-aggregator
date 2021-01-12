const { network } = require("hardhat");

module.exports.getAggregatedOracles = () => {
  if (network.name == "hardhat" || network.name == "mainnet") {
    const stablecoins = [
      network.config.addresses.usdAddress,
      network.config.addresses.usdcAddress,
      network.config.addresses.usdtAddress,
      network.config.addresses.daiAddress,
      network.config.addresses.busdAddress,
      network.config.addresses.susdAddress,
      network.config.addresses.tusdAddress,
    ];

    const decimals = [8, 6, 6, 18, 18, 18, 18];

    const oracleTokens = [
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
  } else {
    throw Error(`unsupported network ${network.name}`);
  }
};
