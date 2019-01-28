import { Account, Action } from "./TasitSdk";
const { Contract, NFT } = Action;
import { expect, assert } from "chai";
import { createFromPrivateKey } from "tasit-account/dist/testHelpers/helpers";
import {
  mineBlocks,
  createSnapshot,
  revertFromSnapshot,
  wait,
  waitForEthersEvent,
} from "tasit-action/dist/testHelpers/helpers";
import { abi as manaABI } from "./testHelpers/MANAToken.json";
import { abi as landABI } from "./testHelpers/LANDRegistry.json";
import { abi as estateABI } from "./testHelpers/EstateRegistry.json";
import { abi as markplaceABI } from "./testHelpers/Marketplace.json";

const ownerPrivKey =
  "0x11d943d7649fbdeb146dc57bd9cfc80b086bfab2330c7b25651dbaf382392f60";
const anaPrivKey =
  "0xc181b6b02c9757f13f5aa15d1342a58970a8a489722dc0608a1d09fea717c181";
const bobPrivKey =
  "0x4f09311114f0ff4dfad0edaa932a3e01a4ee9f34da2cbd087aa0e6ffcb9eb322";

const manaAddress = "0xb32939da0c44bf255b9810421a55be095f9bb3f4";
const landAddress = "0x6191bc768c2339da9eab9e589fc8bf0b3ab80975";
const estateAddress = "0x41b598a2c618b59b74540ac3afffb32f7971b37a";
const marketplaceAddress = "0x289c42facf691946b64b4370361b1303f0a463ef";

describe("Decentraland", () => {
  let owner;
  let ana;
  let bob;
  let ephemeral;
  let mana;
  let land;
  let estate;
  let marketplace;

  before("", async () => {
    owner = createFromPrivateKey(ownerPrivKey);
    ana = createFromPrivateKey(anaPrivKey);
    bob = createFromPrivateKey(bobPrivKey);
    ephemeral = Account.create();

    expect(owner.address).to.have.lengthOf(42);
    expect(ana.address).to.have.lengthOf(42);
    expect(bob.address).to.have.lengthOf(42);
    expect(ephemeral.address).to.have.lengthOf(42);

    mana = new Contract(manaAddress, manaABI);
    land = new Contract(landAddress, landABI);
    estate = new Contract(estateAddress, estateABI);
    marketplace = new Contract(marketplaceAddress, markplaceABI);
  });

  it("mint lands", async () => {
    // TODO: Fill out this test more
    estate.setWallet(owner);
    //console.log(land.getAddress());
    //estate.initialize("Estate", "EST", land.getAddress());
    //land.createEstate([0], [0], owner.address);
  });
});
