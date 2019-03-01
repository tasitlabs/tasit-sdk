import ProviderFactory from "./ProviderFactory";
import ConfigLoader from "./ConfigLoader";

const defaultConfig = ConfigLoader.getConfig();

const extractConfigFromProvider = async ethersProvider => {
  await ethersProvider.ready;
  const network = await ethersProvider.getNetwork();
  let { name: networkName } = network;
  const {
    pollingInterval,
    connection,
    apiToken,
    apiAccessToken,
    provider,
    providers,
    path,
  } = ethersProvider;
  const isJsonRpc = connection !== undefined;
  const isEtherscan = apiToken !== undefined;
  const isInfura = apiAccessToken !== undefined;
  const isWeb3 = provider !== undefined;
  const isFallback = providers !== undefined;
  const isIpc = path !== undefined;

  if (networkName === "unknown") networkName = "other";

  let configProvider = {
    network: networkName,
    pollingInterval,
  };

  if (isJsonRpc) {
    const { url, user, password, allowInsecure } = connection;
    const { protocol, hostname, port } = new URL(url);
    const jsonRpc = {
      url: `${protocol}//${hostname}`,
      port: Number(port),
      user,
      password,
      allowInsecure,
    };
    configProvider = { ...configProvider, provider: "jsonrpc", jsonRpc };
  }

  const config = { provider: configProvider, events: { timeout: 2000 } };
  return config;
};

const fulfillWithDefaults = config => {
  let { provider } = config;
  let { jsonRpc } = provider;
  const isJsonRpc = jsonRpc !== undefined;
  if (isJsonRpc) {
    const { user, password, allowInsecure } = jsonRpc;
    if (allowInsecure === undefined)
      jsonRpc = { ...jsonRpc, user, password, allowInsecure: false };

    provider = { ...provider, jsonRpc };
  }

  config = { ...config, provider };
  return config;
};

const checkConfig = async config => {
  ConfigLoader.setConfig(config);
  const provider = ProviderFactory.getProvider();
  const configFromProvider = await extractConfigFromProvider(provider);
  const configWithDefaults = fulfillWithDefaults(config);

  expect(configFromProvider).to.deep.equal(configWithDefaults);
};

describe("TasitAction.ConfigLoader", () => {
  after("back to default config", async () => {
    ConfigLoader.setConfig(defaultConfig);
  });

  it("should create a provider from local blockchain config parameters", async () => {
    const someConfig = {
      provider: {
        network: "other",
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

    await checkConfig(someConfig);
  });
});
