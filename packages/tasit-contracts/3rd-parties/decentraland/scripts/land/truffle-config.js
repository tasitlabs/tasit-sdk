require("babel-register");
require("babel-polyfill");

const HDWalletProvider = require("truffle-hdwallet-provider");

// TODO: Extract to a tasit-contract config/env ignored file
// const mnemonic = process.env.MNEMONIC;
// const token = process.env.INFURA_TOKEN;
const mnemonic =
  "beach swap combine paper music cook electric bullet trust actress liquid asthma";
const token = "974bd2e667b246f29d2589a59600530e";

module.exports = {
  solc: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      gas: 70000000,
      network_id: "*",
    },
    goerli: {
      provider: () => {
        return new HDWalletProvider(
          mnemonic,
          "https://goerli.infura.io/v3/" + token
        );
      },
      network_id: "5",
      gasPrice: 10000000000, // 10 Gwei (https://stats.goerli.net/)
    },
  },
};
