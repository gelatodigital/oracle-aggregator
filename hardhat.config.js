// Buidler
const { task, types } = require("hardhat/config");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("hardhat-deploy-ethers"); 

// Libraries
const assert = require("assert");
const { utils } = require("ethers");

require("dotenv").config();

// @dev Put this in .env
const ALCHEMY_ID = process.env.ALCHEMY_ID;
assert.ok(ALCHEMY_ID, "no Alchemy ID in process.env");

// @dev fill this out
const DEPLOYER = "0x2F4dAcdD6613Dd2d41Ea0C578d7E666bbDAf3424"; //
const DEPLOYER_PK_MAINNET = process.env.DEPLOYER_PK_MAINNET;

const INFURA_PROJECT_ID = "077b5d3032e54de1af44ffeb7936230d";
const KOVAN_PRIVATE_KEY = "ff628d9ffd54b2cf26bb424a73c226fc69637a3c5c36ed60b47ed29a380d44fe";


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  // hardhat-deploy
  namedAccounts: {
    deployer: {
      default: 0,
      mainnet: DEPLOYER,
    },
  },
  networks: {
    hardhat: {
      // Standard config
      // timeout: 150000,
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_ID}`,
        blockNumber: 11189230,
      },
      // Custom
      GelatoCore: "0x1d681d76ce96E4d70a88A00EBbcfc1E47808d0b8",
    },
   
    mainnet: {
      accounts: DEPLOYER_PK_MAINNET ? [DEPLOYER_PK_MAINNET] : [],
      chainId: 1,
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_ID}`,
      gasPrice: parseInt(utils.parseUnits("10", "gwei")),
    },

    kovan: {
      url: `https://ropsten.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`0x${KOVAN_PRIVATE_KEY}`]
    }

    
  },
  solidity: {
    compilers: [
      {
        version: "0.6.10",
        settings: {
          optimizer: { enabled: process.env.DEBUG ? false : true },
        },
      },
      {
        version: "0.7.4",
        settings: {
          optimizer: { enabled: process.env.DEBUG ? false : true },
        },
      },
    ],
    // overrides: {
    //   "contracts/vendor/DependenciesSix.sol": {
    //     version: "0.6.10",
    //     settings: {
    //       optimizer: {enabled: process.env.DEBUG ? false : true},
    //     },
    //   },
    //   "@gelatonetwork/core/contracts/gelato_core/GelatoCore.sol": {
    //     version: "0.6.10",
    //     settings: {
    //       optimizer: {enabled: process.env.DEBUG ? false : true},
    //     },
    //   },
    //   "@gelatonetwork/core/contracts/external/Ownable.sol": {
    //     version: "0.6.10",
    //     settings: {
    //       optimizer: {enabled: process.env.DEBUG ? false : true},
    //     },
    //   },
    // },
  },
};
