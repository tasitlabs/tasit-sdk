import { ethers } from "ethers";
import TasitContracts from "../../../tasit-contracts/dist";
const { local: localContracts, ropsten: ropstenContracts } = TasitContracts;

// Helpers
import actionHelpers from "tasit-action/dist/testHelpers/helpers";
global = Object.assign(global, actionHelpers);

const { Contract: ethersContract } = ethers;

export const duration = {
  seconds: function(val) {
    return val;
  },
  minutes: function(val) {
    return val * this.seconds(60);
  },
  hours: function(val) {
    return val * this.minutes(60);
  },
  days: function(val) {
    return val * this.hours(24);
  },
  weeks: function(val) {
    return val * this.days(7);
  },
  years: function(val) {
    return val * this.days(365);
  },
};

// The Mana contract deployed on ropsten network has a setBalance function
const ropstenManaFaucet = async (provider, walletWithGas, to, amountInWei) => {
  const { MANAToken } = ropstenContracts;
  const { address: MANA_ADDRESS } = MANAToken;
  const connectedWallet = walletWithGas.connect(provider);
  const manaABI = ["function setBalance(address to, uint256 amount)"];
  const mana = new ethersContract(MANA_ADDRESS, manaABI, connectedWallet);
  const tx = await mana.setBalance(to.address, amountInWei);
  await provider.waitForTransaction(tx.hash);
};

export const helpers = {
  duration,
  ropstenManaFaucet,
};

export default helpers;
