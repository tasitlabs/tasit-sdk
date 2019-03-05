import "ethers/dist/shims.js";
// Note: ethers SHOULD be imported from their main object
// shims aren't injected with package import
import { ethers } from "ethers";
import { ConfigLoader } from "./ConfigLoader";

export class ProviderFactory {
  static getProvider = () => {
    const { provider: providerConfig } = ConfigLoader.getConfig();
    return ProviderFactory.createProvider(providerConfig);
  };

  static createProvider = ({
    network,
    provider,
    pollingInterval,
    jsonRpc,
    infura,
    etherscan,
  }) => {
    const networks = ["mainnet", "rinkeby", "ropsten", "kovan", "other"];
    const providers = ["fallback", "infura", "etherscan", "jsonrpc"];

    if (!networks.includes(network)) {
      throw new Error(`Invalid network, use: [${networks}].`);
    }

    if (!providers.includes(provider)) {
      throw new Error(`Invalid provider, use: [${providers}].`);
    }

    if (provider === "fallback") provider = "default";
    if (network === "mainnet") network = "homestead";
    else if (network === "other") network = undefined;

    const defaultConfig = ConfigLoader.getDefaultConfig();

    let ethersProvider;

    switch (provider) {
      case "default":
        ethersProvider = ethers.getDefaultProvider(network);
        break;

      case "infura":
        const infuraApiKey = !infura ? null : infura.apiKey;
        ethersProvider = new ethers.providers.InfuraProvider(
          network,
          infuraApiKey
        );
        break;

      case "etherscan":
        const etherscanApiKey = !etherscan ? null : etherscan.apiKey;
        ethersProvider = new ethers.providers.EtherscanProvider(
          network,
          etherscanApiKey
        );
        break;

      case "jsonrpc":
        let { url, port, user, password, allowInsecure } = jsonRpc;
        if (url === undefined) url = defaultConfig.jsonRpc.url;
        if (port === undefined) port = defaultConfig.jsonRpc.port;
        if (allowInsecure === undefined)
          allowInsecure = defaultConfig.jsonRpc.allowInsecure;

        ethersProvider = new ethers.providers.JsonRpcProvider(
          { url: `${url}:${port}`, user, password, allowInsecure },
          network
        );
        break;
    }

    if (pollingInterval) ethersProvider.pollingInterval = pollingInterval;
    return ethersProvider;
  };
}

export default ProviderFactory;
