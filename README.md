# Oracle Aggregator

Aggregates chainlink oracles for a one stop shop to retrieve the current prices of token pairs.

To run the tests fill `.env` file with ALCHEMY_ID

To deploy fill `.env` with `DEPLOYER_PK_MAINNET | DEPLOYER_PK_RINKEBY` (0x prefixed private key) and fill the `DEPLOYER_MAINNET | DEPLOYER_RINKEBY` var in `hardhat.config.js` with the deployer's ethereum address.
