import ERC721 from "./ERC721";
import TasitContracts from "@tasit/contracts";
import ProviderFactory from "../../ProviderFactory";

import {
  accounts,
  mineBlocks,
  expectExactTokenBalances,
} from "../../testHelpers/helpers";

import sinon from "sinon";

const { local: localContracts } = TasitContracts;
const { MyERC721, SampleContract } = localContracts;
const { address: ERC721_ADDRESS } = MyERC721;
const { address: SAMPLE_CONTRACT_ADDRESS } = SampleContract;
const provider = ProviderFactory.getProvider();

interface Event {
  from: string;
  to: string;
  tokenId: number;
}

describe("TasitAction.ERC721.ERC721", () => {
  let owner;
  let ana;
  let bob;
  let erc721;

  let action;

  beforeAll(async () => {
    [owner, ana, bob] = accounts;
  });

  beforeEach(async () => {
    action = undefined;

    erc721 = new ERC721(ERC721_ADDRESS, owner);

    expect(erc721).toBeDefined();
    expect(erc721.getAddress()).toBe(ERC721_ADDRESS);
    expect(erc721.name).toBeDefined();
    expect(erc721.symbol).toBeDefined();
    expect(erc721._getProvider()).toBeDefined();

    // This line ensures that a new event listener does not catch an existing event from last the block
    // Two blocks to minimize the risk that polling doesn't occur.
    await mineBlocks(provider, 2);

    await expectExactTokenBalances(
      erc721,
      [owner.address, ana.address, bob.address],
      [0, 0, 0]
    );
  });

  afterEach(async () => {
    // This line ensures that a new event listener does not catch an existing event from last the block
    // Two blocks to minimize the risk that polling doesn't occur.
    await mineBlocks(provider, 2);

    expect(provider._events).toHaveLength(0);

    if (erc721) {
      erc721.unsubscribe();

      expect(erc721.subscribedEventNames()).toHaveLength(0);

      expect(erc721.getEmitter()._events).toHaveLength(0);
    }

    if (action) {
      await action.waitForOneConfirmation();
      action.unsubscribe();

      expect(action.subscribedEventNames()).toHaveLength(0);

      expect(action.getEmitter()._events).toHaveLength(0);
    }

    if (erc721) {
      erc721.unsubscribe();

      expect(erc721.subscribedEventNames()).toHaveLength(0);

      expect(erc721.getEmitter()._events).toHaveLength(0);
    }
  });

  describe("should throw error when instantiated with invalid args", () => {
    it("constructor without address", async () => {
      expect(() => {
        // @ts-ignore: TS2554
        new ERC721();
      }).toThrowError();
    });

    it("constructor with invalid address", async () => {
      expect(() => {
        // @ts-ignore: TS2554
        new ERC721("invalid address");
      }).toThrowError();
    });
  });

  it("should call a read-only contract method", async () => {
    const name = await erc721.name();
    expect(name).toBeDefined();
    expect(name).toBe("ERC721");
  });

  describe("ERC721 functions", () => {
    const tokenId = 1;
    const zeroAddress = "0x0000000000000000000000000000000000000000";

    // should mint one token to ana
    beforeEach(async () => {
      action = erc721.mint(ana.address, tokenId);
      await action.send();

      const event: Event = await new Promise(function (resolve, reject) {
        erc721.on("Transfer", (message) => {
          const { data } = message;
          const { args } = data;
          resolve(args);
        });

        setTimeout(() => {
          reject(new Error("timeout"));
        }, 2000);
      });

      erc721.off("Transfer");

      expect(event.from).toBe(zeroAddress);
      expect(event.to).toBe(ana.address);
      expect(event.tokenId).toBe(tokenId);

      await expectExactTokenBalances(erc721, [ana.address], [1]);
    });

    it("should transfer an owned token", async () => {
      erc721 = new ERC721(ERC721_ADDRESS, ana);

      const transferListener = sinon.fake((message) => {
        const { data } = message;
        const { args } = data;

        expect(args.from).toBe(ana.address);
        expect(args.to).toBe(bob.address);
        expect(args.tokenId.toNumber()).toBe(tokenId);
      });

      const errorListener = sinon.fake();

      erc721.on("error", errorListener);
      erc721.on("Transfer", transferListener);

      action = erc721.transferFrom(ana.address, bob.address, tokenId);

      await action.send();
      await action.waitForOneConfirmation();

      await mineBlocks(provider, 2);

      expect(errorListener.called).toBe(false);

      await expectExactTokenBalances(
        erc721,
        [ana.address, bob.address],
        [0, 1]
      );
    });

    it("should transfer an approved token", async () => {
      erc721 = new ERC721(ERC721_ADDRESS, ana);

      action = erc721.approve(bob.address, tokenId);
      await action.send();

      await action.waitForOneConfirmation();

      erc721.setAccount(bob);
      action = erc721.transferFrom(ana.address, bob.address, tokenId);
      await action.send();

      await action.waitForOneConfirmation();

      await expectExactTokenBalances(erc721, [bob.address], [1]);
    });

    it("should transfer an owned token using safeTransferFrom", async () => {
      erc721 = new ERC721(ERC721_ADDRESS, ana);

      action = erc721.safeTransferFrom(ana.address, bob.address, tokenId);
      await action.send();

      await action.waitForOneConfirmation();

      await expectExactTokenBalances(
        erc721,
        [ana.address, bob.address],
        [0, 1]
      );
    });

    it(
      "should trigger an error if the user is listening for errors from a contract and tries safeTransferFrom to a contract without onERC721Received",
      async () => {
        const contractErrorFakeFn = sinon.fake();

        erc721 = new ERC721(ERC721_ADDRESS, ana);

        const contractErrorListener = (error) => {
          const { message } = error;
          expect(message).toBe("Action failed.");
          contractErrorFakeFn();
        };

        erc721.on("error", contractErrorListener);

        action = erc721.safeTransferFrom(
          ana.address,
          SAMPLE_CONTRACT_ADDRESS,
          tokenId
        );
        await action.send();

        // Some error (orphan block, failed tx) events are being triggered only from the confirmationListener
        // See more: https://github.com/tasitlabs/tasit-sdk/issues/253
        action.on("confirmation", () => {
          // do nothing
        });

        await action.waitForOneConfirmation();

        await mineBlocks(provider, 2);

        expect(contractErrorFakeFn.called).toBe(true);

        await expectExactTokenBalances(
          erc721,
          [ana.address, SAMPLE_CONTRACT_ADDRESS],
          [1, 0]
        );
      }
    );

    it(
      "should trigger an error if the user is listening for errors for an action and tries safeTransferFrom to a contract without onERC721Received",
      async () => {
        const actionErrorFakeFn = sinon.fake();

        erc721 = new ERC721(ERC721_ADDRESS, ana);

        const actionErrorListener = (error) => {
          const { message } = error;
          expect(message).toBe("Action failed.");
          actionErrorFakeFn();
        };

        action = erc721.safeTransferFrom(
          ana.address,
          SAMPLE_CONTRACT_ADDRESS,
          tokenId
        );
        action.on("error", actionErrorListener);

        // Some error (orphan block, failed tx) events are being triggered only from the confirmationListener
        // See more: https://github.com/tasitlabs/tasit-sdk/issues/253
        action.on("confirmation", () => {
          // do nothing
        });

        await action.send();

        await action.waitForOneConfirmation();

        await mineBlocks(provider, 1);

        expect(actionErrorFakeFn.called).toBe(true);

        await expectExactTokenBalances(
          erc721,
          [ana.address, SAMPLE_CONTRACT_ADDRESS],
          [1, 0]
        );
      }
    );
  });
});
