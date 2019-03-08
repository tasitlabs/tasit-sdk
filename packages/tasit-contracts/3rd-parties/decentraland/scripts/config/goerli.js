// Note: ethers.js isn't supporting goerli with Infura yet
// See more: https://github.com/ethers-io/ethers.js/issues/421#issuecomment-471037522
const goerli = {
  provider: {
    network: "goerli",
    provider: "etherscan",
    pollingInterval: 4000,
  },
  events: {
    timeout: 2000,
  },
};

module.exports = goerli;
