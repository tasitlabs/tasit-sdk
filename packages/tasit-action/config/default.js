// All config properties
const config = {
  // Blockchain connection provider properties
  provider: {
    // Networks: mainnet, rinkeby, ropsten, kovan, other (default: other)
    network: "other",
    // Providers: fallback (uses infura and etherscan combined), infura, etherscan, jsonrpc (default: fallback)
    provider: "jsonrpc",
    // The frequency (in ms) that the provider is polling. (default: 4000)
    // This may make sense to lower for PoA networks or when polling a local node.
    // When polling Etherscan or INFURA, setting this too low may result in the service blocking your IP address or otherwise throttling your API calls.
    pollingInterval: 4000,
    // JSON-RPC connection properties
    jsonRpc: {
      url: "http://localhost", // The JSON-RPC URL (default: "http://localhost")
      port: 8545, // the JSON-RPC Port (default: 8545)
      user: "RPC_USE", // A username to use for Basic Authentication (default: "")
      password: "RPC_PASS", // A username to use for Basic Authentication (default: "")
      allowInsecure: false, // Allow Basic Authentication over an insecure HTTP network (default: false)
    },
    // Infura connection properties
    infura: {
      apiKey: "INFURA_API_KEY", // Infura v2 API Key (default: "")
    },
    // Etherscan connection properties
    etherscan: {
      apiKey: "ETHERSCAN_API_KEY", // Etherscan API Key (default: "")
    },
  },
  // Events properties
  events: {
    timeout: 2000, // After this many millisecconds, the event listener will reject with a timeout error (default: 2000)
  },
};

// Development using ganache-cli
const development = {
  provider: {
    network: "other",
    provider: "jsonrpc",
    pollingInterval: 100,
    jsonRpc: {
      url: "http://localhost",
      port: 8545,
    },
  },
  events: {
    timeout: 2000,
  },
};

// Testnet using Infura
const testnet = {
  network: "ropsten",
  provider: "infura",
  pollingInterval: 4000,
};

// Default config
const mainnet = {
  network: "mainnet",
  provider: "fallback",
  pollingInterval: 4000,
};

module.exports = development;
