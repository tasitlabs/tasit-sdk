// @ts-ignore semantic error TS6307
import gnosisSafeABI from "../abi/GnosisSafe.json";

// @ts-ignore semantic error TS6307
import myERC20ABI from "../abi/MyERC20.json";
// @ts-ignore semantic error TS6307
import myERC721ABI from "../abi/MyERC721.json";

// @ts-ignore semantic error TS6307
import sampleContractABI from "../abi/SampleContract.json";

// Note: Under the current `tasit-contracts` setup the contracts always will deployed with these addresses
// See https://github.com/tasitlabs/tasit-sdk/issues/138
const local = {
  SampleContract: {
    address: "0x5e1cEBbbF763093e900c280dBe688363d98c660B",
    abi: sampleContractABI,
  },
  MyERC721: {
    address: "0xd3A840fDfecE8C7Eb38FE900D588584D4da92785",
    abi: myERC721ABI,
  },
  MyERC20: {
    address: "0xd9D3960AbD6681c85cE3f6fE502F7C0d86343C6E",
    abi: myERC20ABI,
  },
  GnosisSafe: {
    address: "0x788BAFE1c0Fc303213B8a954dE9EF07C2420Bf64",
    abi: gnosisSafeABI,
  },
};

const goerli = {
};

const ropsten = {
  GnosisSafe: {
    address: "0xdF1108C839686f28b5010a1784a07262aA447722",
    abi: gnosisSafeABI,
  },
};

const rinkebyDeployedByDevMetaMask = {
    GnosisSafe: {
      address: "0xc8FB1F400D4718c022d5aA8c7eDf8A3A685cf3E2",
      abi: gnosisSafeABI,
    },
  };
  
const rinkeby = {
    GnosisSafe: {
      address: "0x366dd6FdB8EA347A186e251e39bE1f12eF11cc8A",
      abi: gnosisSafeABI,
    },
  };
  

export const Contracts = {
  local,
  goerli,
  ropsten,
  rinkeby,
};

export default Contracts;
