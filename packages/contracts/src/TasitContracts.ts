// @ts-ignore semantic error TS6307
import gnosisSafeABI from "../artifacts/GnosisSafe.json";

// @ts-ignore semantic error TS6307
import myERC20ABI from "../artifacts/MyERC20.json";
// @ts-ignore semantic error TS6307
import myERC721ABI from "../artifacts/MyERC721.json";

// @ts-ignore semantic error TS6307
import sampleContractABI from "../artifacts/SampleContract.json";

// TODO: Debug this rollup error:
// Error: Could not resolve '../typechain/SampleContract' from src/TasitContracts.ts
// import { SampleContract } from "../typechain/SampleContract";
// import { GnosisSafe } from "../typechain/GnosisSafe";
// import { MyErc20 } from "../typechain/MyErc20";
// import { MyErc721 } from "../typechain/MyErc721";

// TODO: Decide whether we want to export instantiated contracts as well
// We do, that way the typings will pass through more naturally
// Hmm, but that won't work if we want to still use a new ERC20() here.
// Maybe rather than having Contract handle that in @tasit/action contract dir
// We make a function available that exposes ethers contract instantiation
// as a function with one arg pre-filled

// Note: Under the current `@tasit/contracts` setup the contracts always will deployed with these addresses
// See https://github.com/tasitlabs/tasit-sdk/issues/138

// TODO: Update these new addresses with the new buidler
// setup
const local = {
  SampleContract: {
    address: "0x7c2C195CD6D34B8F845992d380aADB2730bB9C6F",
    abi: sampleContractABI.abi,
    // type: SampleContract
  },
  MyERC721: {
    address: "0x8858eeB3DfffA017D4BCE9801D340D36Cf895CCf",
    abi: myERC721ABI.abi,
    // type: MyErc721
  },
  MyERC20: {
    address: "0x0078371BDeDE8aAc7DeBfFf451B74c5EDB385Af7",
    abi: myERC20ABI.abi,
    // type: MyErc20
  },
  GnosisSafe: {
    address: "0x788BAFE1c0Fc303213B8a954dE9EF07C2420Bf64", // TODO: Fix this address for Buidler
    abi: gnosisSafeABI.abi,
    // type: GnosisSafe
  },
};

const goerli = {};

const ropsten = {
  GnosisSafe: {
    address: "0xdF1108C839686f28b5010a1784a07262aA447722",
    abi: gnosisSafeABI.abi,
    // type: GnosisSafe
  },
};

const rinkebyDeployedByDevMetaMask = {
  GnosisSafe: {
    address: "0xc8FB1F400D4718c022d5aA8c7eDf8A3A685cf3E2",
    abi: gnosisSafeABI.abi,
    // type: GnosisSafe
  },
};

const rinkeby = {
  GnosisSafe: {
    address: "0x366dd6FdB8EA347A186e251e39bE1f12eF11cc8A",
    abi: gnosisSafeABI.abi,
    // type: GnosisSafe
  },
};

export const Contracts = {
  local,
  goerli,
  ropsten,
  rinkeby,
  rinkebyDeployedByDevMetaMask,
};

export default Contracts;
