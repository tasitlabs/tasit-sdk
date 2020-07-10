import "ethers/dist/shims.js";
// Note: ethers SHOULD be imported from their main object
// shims aren't injected with package import
import { ethers } from "ethers";
import { ConfigLoader } from "./ConfigLoader";

import { JsonRpc, Infura, Etherscan } from "./types";

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
  }: {
    network: string,
    provider: string,
    pollingInterval: number,
    jsonRpc: JsonRpc,
    infura: Infura,
    etherscan: Etherscan,
  }) => {
    const networks = [
      "mainnet",
      "rinkeby",
      "ropsten",
      "kovan",
      "goerli",
      "other",
    ];
    const providers = ["fallback", "infura", "etherscan", "jsonrpc"];

    let networkToUse: string | undefined;

    if (!networks.includes(network)) {
      throw new Error(`Invalid network, use: [${networks}].`);
    }

    if (!providers.includes(provider)) {
      throw new Error(`Invalid provider, use: [${providers}].`);
    }

    if (provider === "fallback") provider = "default";
    if (network === "mainnet") networkToUse = "homestead";

    else if (network === "other") networkToUse = undefined;

    const defaultConfig = ConfigLoader.getDefaultConfig();

    let ethersProvider;

    switch (provider) {
      case "default": {
        ethersProvider = ethers.getDefaultProvider(networkToUse);
        break;
      }
      case "infura": {
        const infuraApiKey = !infura ? null : infura.apiKey;
        if (infuraApiKey) {
          ethersProvider = new ethers.providers.InfuraProvider(
            networkToUse,
            infuraApiKey
          );
        }
        break;
      }
      case "etherscan": {
        const etherscanApiKey = !etherscan ? null : etherscan.apiKey;
        if (etherscanApiKey) {
          ethersProvider = new ethers.providers.EtherscanProvider(
            networkToUse,
            etherscanApiKey
          );
        }
        break;
      }
      case "jsonrpc": {
        let { url, port, allowInsecure } = jsonRpc;
        const { user, password } = jsonRpc;
        if (url === undefined) url = defaultConfig.jsonRpc.url;
        if (port === undefined) port = defaultConfig.jsonRpc.port;
        if (allowInsecure === undefined)
          allowInsecure = defaultConfig.jsonRpc.allowInsecure;

        ethersProvider = new ethers.providers.JsonRpcProvider(
          { url: `${url}:${port}`, user, password, allowInsecure },
          networkToUse
        );
        break;
      }
    }

    if (ethersProvider && pollingInterval) ethersProvider.pollingInterval = pollingInterval;
    return ethersProvider;
  };
}

export default ProviderFactory;
