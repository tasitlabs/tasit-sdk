import NFT from "./NFT";

// Note: Under the current `tasit-contracts` setup FullNFT aways will deployed with this address
// See https://github.com/tasitlabs/TasitSDK/issues/138
const fullNFTAddress = "0x0E86f209729bf54763789CDBcA9E8b94f0FD5333";

// Note: Under the current `tasit-contracts` setup SimpleStorageWithRemoved aways will deployed with this address
// See https://github.com/tasitlabs/TasitSDK/issues/138
const simpleStorageWithRemovedAddress =
  "0x6C4A015797DDDd87866451914eCe1e8b19261931";

describe("TasitAction.NFT", () => {
  let owner,
    ana,
    bob,
    fullNFT,
    provider,
    snapshotId,
    txSubscription,
    contractSubscription;

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
    // This line ensures that a new event listener does not catch an existing event from last the block
    await mineBlocks(provider, 1);

    expect(provider._events, "ethers.js should not be listening to any events.")
      .to.be.empty;

    if (contractSubscription) {
      contractSubscription.unsubscribe();

      expect(contractSubscription.subscribedEventNames()).to.be.empty;

      expect(
        contractSubscription.getEmitter()._events,
        "ethers.js should not be listening to any events."
      ).to.be.empty;
    }

    if (txSubscription) {
      await txSubscription.waitForNonceToUpdate();
      txSubscription.unsubscribe();

      expect(txSubscription.subscribedEventNames()).to.be.empty;

      expect(
        txSubscription.getEmitter()._events,
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
      const balanceBefore = await fullNFT.balanceOf(ana.address);
      expect(balanceBefore.toNumber()).to.equal(0);

      contractSubscription = fullNFT.subscribe();

      txSubscription = fullNFT.mint(ana.address, tokenId);

      const event = await new Promise(function(resolve, reject) {
        contractSubscription.on("Transfer", message => {
          const { data } = message;
          const { args } = data;
          resolve(args);
        });

        setTimeout(() => {
          reject(new Error("timeout"));
        }, 1000);
      });

      contractSubscription.off("Transfer");

      expect(event.from).to.equal(zeroAddress);
      expect(event.to).to.equal(ana.address);
      expect(event.tokenId.eq(tokenId)).to.be.true;

      const balanceAfter = await fullNFT.balanceOf(ana.address);
      expect(balanceAfter.toNumber()).to.equal(1);
    });

    it("should transfer an owned token", async () => {
      let senderBalance, receiverBalance;

      fullNFT = new NFT(fullNFTAddress, ana);

      senderBalance = await fullNFT.balanceOf(ana.address);
      expect(senderBalance.toNumber()).to.equal(1);

      receiverBalance = await fullNFT.balanceOf(bob.address);
      expect(receiverBalance.toNumber()).to.equal(0);

      contractSubscription = fullNFT.subscribe();

      txSubscription = fullNFT.transferFrom(ana.address, bob.address, tokenId);

      const event = await new Promise(function(resolve, reject) {
        contractSubscription.on("Transfer", message => {
          const { data } = message;
          const { args } = data;
          resolve(args);
        });

        setTimeout(() => {
          reject(new Error("timeout"));
        }, 1000);
      });

      expect(event.from).to.equal(ana.address);
      expect(event.to).to.equal(bob.address);
      expect(event.tokenId.toNumber()).to.equal(tokenId);

      senderBalance = await fullNFT.balanceOf(ana.address);
      expect(senderBalance.toNumber()).to.equal(0);

      receiverBalance = await fullNFT.balanceOf(bob.address);
      expect(receiverBalance.toNumber()).to.equal(1);
    });

    it("should transfer an approved token", async () => {
      fullNFT = new NFT(fullNFTAddress, ana);

      txSubscription = fullNFT.approve(bob.address, tokenId);

      await txSubscription.waitForNonceToUpdate();

      fullNFT.setWallet(bob);

      const balanceBefore = await fullNFT.balanceOf(bob.address);
      expect(balanceBefore.toNumber()).to.equal(0);

      txSubscription = fullNFT.transferFrom(ana.address, bob.address, tokenId);

      await txSubscription.waitForNonceToUpdate();

      const balanceAfter = await fullNFT.balanceOf(bob.address);
      expect(balanceAfter.toNumber()).to.equal(1);
    });

    it("should transfer an owned token using safeTransferFrom", async () => {
      let senderBalance, receiverBalance;

      fullNFT = new NFT(fullNFTAddress, ana);

      senderBalance = await fullNFT.balanceOf(ana.address);
      expect(senderBalance.toNumber()).to.equal(1);

      receiverBalance = await fullNFT.balanceOf(bob.address);
      expect(receiverBalance.toNumber()).to.equal(0);

      txSubscription = fullNFT.safeTransferFrom(
        ana.address,
        bob.address,
        tokenId
      );

      await txSubscription.waitForNonceToUpdate();

      senderBalance = await fullNFT.balanceOf(ana.address);
      expect(senderBalance.toNumber()).to.equal(0);

      receiverBalance = await fullNFT.balanceOf(bob.address);
      expect(receiverBalance.toNumber()).to.equal(1);
    });

    it("shouldn't do a safeTransferFrom to a contract that doesn't implement `onERC721Received` - Contract Subscription", async () => {
      let senderBalance, receiverBalance;
      const sender = ana.address;
      const receiver = simpleStorageWithRemovedAddress;
      const contractErrorFakeFn = sinon.fake();

      fullNFT = new NFT(fullNFTAddress, ana);

      senderBalance = await fullNFT.balanceOf(sender);
      expect(senderBalance.toNumber()).to.equal(1);

      receiverBalance = await fullNFT.balanceOf(receiver);
      expect(receiverBalance.toNumber()).to.equal(0);

      const contractErrorListener = message => {
        const { error, eventName } = message;
        expect(error.message).to.equal(
          "Action with error: VM Exception while processing transaction: revert"
        );
        contractErrorFakeFn();
      };

      fullNFT.on("error", contractErrorListener);

      txSubscription = fullNFT.safeTransferFrom(sender, receiver, tokenId);
      await txSubscription.waitForNonceToUpdate();

      expect(contractErrorFakeFn.called).to.be.true;

      senderBalance = await fullNFT.balanceOf(sender);
      expect(senderBalance.toNumber()).to.equal(1);

      receiverBalance = await fullNFT.balanceOf(receiver);
      expect(receiverBalance.toNumber()).to.equal(0);
    });

    it("should trigger an error if the user is listening for errors for an action and tries safeTransferFrom to a contract without onERC721Received", async () => {
      let senderBalance, receiverBalance;
      const sender = ana.address;
      const receiver = simpleStorageWithRemovedAddress;
      const actionErrorFakeFn = sinon.fake();

      fullNFT = new NFT(fullNFTAddress, ana);

      senderBalance = await fullNFT.balanceOf(sender);
      expect(senderBalance.toNumber()).to.equal(1);

      receiverBalance = await fullNFT.balanceOf(receiver);
      expect(receiverBalance.toNumber()).to.equal(0);

      const actionErrorListener = message => {
        const { error, eventName } = message;
        expect(error.message).to.equal(
          "Action with error: VM Exception while processing transaction: revert"
        );
        actionErrorFakeFn();
      };

      txSubscription = fullNFT.safeTransferFrom(sender, receiver, tokenId);
      txSubscription.on("error", actionErrorListener);

      await txSubscription.waitForNonceToUpdate();

      expect(actionErrorFakeFn.called).to.be.true;

      senderBalance = await fullNFT.balanceOf(sender);
      expect(senderBalance.toNumber()).to.equal(1);

      receiverBalance = await fullNFT.balanceOf(receiver);
      expect(receiverBalance.toNumber()).to.equal(0);
    });
  });
});
