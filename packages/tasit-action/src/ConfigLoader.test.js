import ProviderFactory from "./ProviderFactory";
import ConfigLoader from "./ConfigLoader";

// Note: This test suite needs to be improved
describe("TasitAction.ConfigLoader", () => {
  let defaultConfig;

  before("save original config", async () => {
    defaultConfig = ConfigLoader.getConfig();
  });

  after("back to original config", async () => {
    ConfigLoader.setConfig(defaultConfig);
  });

  it("should config provider from ConfigLoader parameters", async () => {
    const config = {
      provider: {
        network: "other",
        provider: "jsonrpc",
        pollingInterval: 50,
        jsonRpc: {
          url: "http://some.node.eth",
          port: 1234,
        },
      },
      events: {
        timeout: 2000,
      },
    };
    ConfigLoader.setConfig(config);

    const provider = ProviderFactory.getProvider();

    const { connection } = provider;
    const { url } = connection;

    expect(url).to.equal("http://some.node.eth:1234");
  });
});
