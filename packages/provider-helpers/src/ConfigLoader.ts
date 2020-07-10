const MAINNET = "mainnet";
// const OTHER = "other";

// All config properties
// const sampleConfig = {
//   // Blockchain connection provider properties
//   provider: {
//     // Networks: mainnet, rinkeby, ropsten, kovan, other (default: other)
//     network: "other",
//     // Providers: fallback (uses infura and etherscan combined), infura, etherscan, jsonrpc (default: fallback)
//     provider: "jsonrpc",
//     // The frequency (in ms) that the provider is polling. (default: 4000)
//     // This may make sense to lower for PoA networks or when polling a local node.
//     // When polling Etherscan or INFURA, setting this too low may result in the service blocking your IP address or otherwise throttling your API calls.
//     pollingInterval: 4000,
//     // JSON-RPC connection properties
//     jsonRpc: {
//       url: "http://localhost", // The JSON-RPC URL (default: "http://localhost")
//       port: 8545, // the JSON-RPC Port (default: 8545)
//       user: "RPC_USE", // A username to use for Basic Authentication (default: "")
//       password: "RPC_PASS", // A username to use for Basic Authentication (default: "")
//       allowInsecure: false, // Allow Basic Authentication over an insecure HTTP network (default: false)
//     },
//     // Infura connection properties
//     infura: {
//       apiKey: "INFURA_API_KEY", // Infura v2 API Key (default: "")
//     },
//     // Etherscan connection properties
//     etherscan: {
//       apiKey: "ETHERSCAN_API_KEY", // Etherscan API Key (default: "")
//     },
//   },
//   // Events properties
//   events: {
//     timeout: 2000, // After this many millisecconds, the event listener will reject with a timeout error (default: 2000)
//   },
// };

export class ConfigLoader {
  static config: any;

  static setConfig(config: any) {
    this.config = config;
  }

  static getConfig() {
    return this.config;
  }

  static getDefaultConfig() {
    return {
      network: MAINNET, // OTHER
      provider: "fallback",
      pollingInterval: 4000,
      jsonRpc: {
        url: "http://localhost",
        port: 8545,
        allowInsecure: false,
      },
    };
  }
}

export default ConfigLoader;
