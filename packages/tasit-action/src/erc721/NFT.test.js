import NFT from "./NFT";

// Note: Under the current `tasit-contracts` setup FullNFT aways will deployed with this address
// See https://github.com/tasitlabs/TasitSDK/issues/138
const fullNFTAddress = "0x0E86f209729bf54763789CDBcA9E8b94f0FD5333";

// Note: This contract is used not because of the particulars of this contract, but
// just because we needed a contract to send an NFT to and have it fail
// when using safeTransferFrom because this contract doesn't implement
// onERC721Received
const sampleContractAddress = "0x6C4A015797DDDd87866451914eCe1e8b19261931";

describe("TasitAction.ERC721.NFT", () => {
  let owner;
  let ana;
  let bob;
  let fullNFT;
  let provider;
  let snapshotId;
  let action;

  before("", async () => {
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
    action = undefined;

    fullNFT = new NFT(fullNFTAddress, owner);

    expect(fullNFT).to.exist;
    expect(fullNFT.getAddress()).to.equal(fullNFTAddress);
    expect(fullNFT.name).to.exist;
    expect(fullNFT.symbol).to.exist;
    expect(fullNFT._getProvider()).to.exist;

    provider = fullNFT._getProvider();

    // This line ensures that a new event listener does not catch an existing event from last the block
    // Two blocks to minimize the risk that polling doesn't occur.
    await mineBlocks(provider, 2);

    await confirmBalances(
      fullNFT,
      [owner.address, ana.address, bob.address],
      [0, 0, 0]
    );

    snapshotId = await createSnapshot(provider);
  });

  afterEach("", async () => {
    // This line ensures that a new event listener does not catch an existing event from last the block
    // Two blocks to minimize the risk that polling doesn't occur.
    await mineBlocks(provider, 2);

    expect(provider._events, "ethers.js should not be listening to any events.")
      .to.be.empty;

    if (fullNFT) {
      fullNFT.unsubscribe();

      expect(fullNFT.subscribedEventNames()).to.be.empty;

      expect(
        fullNFT.getEmitter()._events,
        "ethers.js should not be listening to any events."
      ).to.be.empty;
    }

    if (action) {
      await action.waitForNonceToUpdate();
      action.unsubscribe();

      expect(action.subscribedEventNames()).to.be.empty;

      expect(
        action.getEmitter()._events,
        "ethers.js should not be listening to any events."
      ).to.be.empty;
    }

    if (fullNFT) {
      fullNFT.unsubscribe();

      expect(fullNFT.subscribedEventNames()).to.be.empty;

      expect(
        fullNFT.getEmitter()._events,
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
    const zeroAddress = "0x0000000000000000000000000000000000000000";

    beforeEach("should mint one token to ana", async () => {
      action = fullNFT.mint(ana.address, tokenId);

      const event = await new Promise(function(resolve, reject) {
        fullNFT.on("Transfer", message => {
          const { data } = message;
          const { args } = data;
          resolve(args);
        });

        setTimeout(() => {
          reject(new Error("timeout"));
        }, 1000);
      });

      fullNFT.off("Transfer");

      expect(event.from).to.equal(zeroAddress);
      expect(event.to).to.equal(ana.address);
      expect(event.tokenId.eq(tokenId)).to.be.true;

      await confirmBalances(fullNFT, [ana.address], [1]);
    });

    // Non-deterministic
    // Note: This test failed recently on CI
    it.skip("should transfer an owned token", async () => {
      fullNFT = new NFT(fullNFTAddress, ana);

      action = fullNFT.transferFrom(ana.address, bob.address, tokenId);

      const event = await new Promise(function(resolve, reject) {
        fullNFT.on("Transfer", message => {
          const { data } = message;
          const { args } = data;
          resolve(args);
        });

        setTimeout(() => {
          reject(new Error("timeout"));
        }, 2000);
      });

      expect(event.from).to.equal(ana.address);
      expect(event.to).to.equal(bob.address);
      expect(event.tokenId.toNumber()).to.equal(tokenId);

      await confirmBalances(fullNFT, [ana.address, bob.address], [0, 1]);
    });

    it("should transfer an approved token", async () => {
      fullNFT = new NFT(fullNFTAddress, ana);
      action = fullNFT.approve(bob.address, tokenId);

      await action.waitForNonceToUpdate();

      fullNFT.setWallet(bob);
      action = fullNFT.transferFrom(ana.address, bob.address, tokenId);

      await action.waitForNonceToUpdate();

      await confirmBalances(fullNFT, [bob.address], [1]);
    });

    it("should transfer an owned token using safeTransferFrom", async () => {
      fullNFT = new NFT(fullNFTAddress, ana);

      action = fullNFT.safeTransferFrom(ana.address, bob.address, tokenId);

      await action.waitForNonceToUpdate();

      await confirmBalances(fullNFT, [ana.address, bob.address], [0, 1]);
    });

    it("should trigger an error if the user is listening for errors from a contract and tries safeTransferFrom to a contract without onERC721Received", async () => {
      const contractErrorFakeFn = sinon.fake();

      fullNFT = new NFT(fullNFTAddress, ana);

      const contractErrorListener = message => {
        const { error } = message;
        expect(error.message).to.equal(
          "Action with error: VM Exception while processing transaction: revert"
        );
        contractErrorFakeFn();
      };

      fullNFT.on("error", contractErrorListener);

      action = fullNFT.safeTransferFrom(
        ana.address,
        sampleContractAddress,
        tokenId
      );
      await action.waitForNonceToUpdate();

      expect(contractErrorFakeFn.called).to.be.true;

      await confirmBalances(
        fullNFT,
        [ana.address, sampleContractAddress],
        [1, 0]
      );
    });

    it("should trigger an error if the user is listening for errors for an action and tries safeTransferFrom to a contract without onERC721Received", async () => {
      const actionErrorFakeFn = sinon.fake();

      fullNFT = new NFT(fullNFTAddress, ana);

      const actionErrorListener = message => {
        const { error } = message;
        expect(error.message).to.equal(
          "Action with error: VM Exception while processing transaction: revert"
        );
        actionErrorFakeFn();
      };

      action = fullNFT.safeTransferFrom(
        ana.address,
        sampleContractAddress,
        tokenId
      );
      action.on("error", actionErrorListener);

      await action.waitForNonceToUpdate();

      expect(actionErrorFakeFn.called).to.be.true;

      await confirmBalances(
        fullNFT,
        [ana.address, sampleContractAddress],
        [1, 0]
      );
    });
  });
});
