const forkedRopsten = {
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

module.exports = forkedRopsten;
