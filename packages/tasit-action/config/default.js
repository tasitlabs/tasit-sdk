module.exports = {
  provider: {
    network: "other",
    provider: "jsonrpc",
    pollingInterval: 50,
    jsonRpc: {
      url: "http://localhost:8545",
      user: "",
      password: "",
      allowInsecure: true,
    },
  },
  events: {
    timeout: 2000,
  },
};
