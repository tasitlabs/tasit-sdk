import NFT from "./NFT";

// Note: Under the current `tasit-contracts` setup FullNFT aways will deployed with this address
// See https://github.com/tasitlabs/TasitSDK/issues/138
const fullNFTAddress = "0x0E86f209729bf54763789CDBcA9E8b94f0FD5333";

describe("TasitAction.NFT", () => {
  let owner,
    ana,
    bob,
    fullNFT,
    provider,
    snapshotId,
    txSubscription,
    contractSubscription;

  before("", () => {
    owner = createFromPrivateKey(
      "0x11d943d7649fbdeb146dc57bd9cfc80b086bfab2330c7b25651dbaf382392f60"
    );

    ana = createFromPrivateKey(
      "0xc181b6b02c9757f13f5aa15d1342a58970a8a489722dc0608a1d09fea717c181"
    );

    bob = createFromPrivateKey(
      "0x4f09311114f0ff4dfad0edaa932a3e01a4ee9f34da2cbd087aa0e6ffcb9eb322"
    );
  });

  beforeEach("", async () => {
    if (txSubscription) {
      expect(txSubscription.subscribedEventNames()).to.be.empty;
    }

    txSubscription = undefined;
    contractSubscription = undefined;

    fullNFT = new NFT(fullNFTAddress, owner);

    expect(fullNFT).to.exist;
    expect(fullNFT.getAddress()).to.equal(fullNFTAddress);
    expect(fullNFT.name).to.exist;
    expect(fullNFT.symbol).to.exist;
    expect(fullNFT.getProvider()).to.exist;

    provider = fullNFT.getProvider();
    snapshotId = await createSnapshot(provider);
  });

  afterEach("", async () => {
    if (contractSubscription) {
      contractSubscription.unsubscribe();

      expect(
        contractSubscription.getEmitter()._events,
        "ethers.js should not be listening to any events."
      ).to.be.empty;
    }

    if (txSubscription) {
      await txSubscription.waitForNonceToUpdate();
      txSubscription.unsubscribe();

      expect(
        txSubscription.getEmitter()._events,
        "ethers.js should not be listening to any events."
      ).to.be.empty;
    }

    await revertFromSnapshot(provider, snapshotId);
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

  describe("ERC721 functions", () => {
    const tokenId = 1;

    beforeEach("should mint one token to owner", async () => {
      const balanceBefore = await fullNFT.balanceOf(owner.address);
      expect(toBN(balanceBefore)).to.be.bignumber.equal(toBN(0));

      txSubscription = fullNFT.mint(owner.address, tokenId);
      await txSubscription.waitForNonceToUpdate();

      const balanceAfter = await fullNFT.balanceOf(owner.address);
      expect(toBN(balanceAfter)).to.be.bignumber.equal(toBN(1));
    });

    it("should transfer an owned token", async () => {
      const balanceBefore = await fullNFT.balanceOf(ana.address);
      expect(toBN(balanceBefore)).to.be.bignumber.equal(toBN(0));

      contractSubscription = fullNFT.subscribe();

      txSubscription = fullNFT.transferFrom(
        owner.address,
        ana.address,
        tokenId
      );

      const event = await new Promise(function(resolve, reject) {
        contractSubscription.on("Transfer", message => {
          const { data } = message;
          const { args } = data;
          resolve(args);
        });
      });

      expect(event.from).to.equal(owner.address);
      expect(event.to).to.equal(ana.address);
      expect(toBN(event.tokenId)).to.be.bignumber.equal(toBN(tokenId));

      const balanceAfter = await fullNFT.balanceOf(ana.address);
      expect(toBN(balanceAfter)).to.be.bignumber.equal(toBN(1));
    });

    it("should transfer an approved token", async () => {
      txSubscription = fullNFT.approve(ana.address, tokenId);

      await txSubscription.waitForNonceToUpdate();

      fullNFT.setWallet(ana);

      const balanceBefore = await fullNFT.balanceOf(ana.address);
      expect(toBN(balanceBefore)).to.be.bignumber.equal(toBN(0));

      txSubscription = fullNFT.transferFrom(
        owner.address,
        ana.address,
        tokenId
      );

      await txSubscription.waitForNonceToUpdate();

      const balanceAfter = await fullNFT.balanceOf(ana.address);
      expect(toBN(balanceAfter)).to.be.bignumber.equal(toBN(1));
    });
  });
});
