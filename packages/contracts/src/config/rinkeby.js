const rinkeby = {
  provider: {
    network: "rinkeby",
    provider: "infura",
    pollingInterval: 4000,
  },
  events: {
    timeout: 5 * 60 * 1000,
  },
};

module.exports = rinkeby;
