const forkedGoerli = {
  provider: {
    network: "goerli",
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
