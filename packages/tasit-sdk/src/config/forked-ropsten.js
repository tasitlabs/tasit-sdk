// Note: ethers.js isn't supporting goerli with Infura yet
// See more: https://github.com/ethers-io/ethers.js/issues/421#issuecomment-471037522
const forkedGoerli = {
  provider: {
    network: "ropsten",
    provider: "jsonrpc",
    pollingInterval: 50,
    jsonRpc: {
      url: "http://localhost",
      port: 8545,
    },
  },
  events: {
    timeout: 2000,
  },
};

module.exports = forkedGoerli;
