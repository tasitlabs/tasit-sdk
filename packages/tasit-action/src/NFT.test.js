import NFT from "./NFT";

// Note: Under the current `tasit-contracts` setup FullNFT aways will deployed with this address
// See https://github.com/tasitlabs/TasitSDK/issues/138
const fullNFTAddress = "0x0E86f209729bf54763789CDBcA9E8b94f0FD5333";

describe("TasitAction.NFT", () => {
  let fullNFT;

  beforeEach("should connect to an existing contract", async () => {
    fullNFT = new NFT(fullNFTAddress);
    expect(fullNFT).to.exist;
    expect(fullNFT.getAddress()).to.equal(fullNFTAddress);
    expect(fullNFT.name).to.exist;
    expect(fullNFT.symbol).to.exist;
    expect(fullNFT.getProvider()).to.exist;
  });

  describe("should throw error when instantiated with invalid args", () => {
    it("constructor without address", async () => {
      expect(() => {
        new Contract();
      }).to.throw();
    });

    it("constructor with invalid address", async () => {
      expect(() => {
        new Contract("invalid address");
      }).to.throw();
    });
  });

  it("should call a read-only contract method", async () => {
    const name = await fullNFT.name();
    expect(name).to.exist;
    expect(name).to.equal("Full NFT");
  });
});
