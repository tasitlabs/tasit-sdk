import estateRegistryABI from "../abi/EstateRegistry.json";
import gnosisSafeABI from "../abi/GnosisSafe.json";

import landProxyABI from "../abi/LANDProxy.json";
import landRegistryABI from "../abi/LANDRegistry.json";
import manaTokenABI from "../abi/MANAToken.json";
import marketplaceABI from "../abi/Marketplace.json";

import myERC20FullABI from "../abi/MyERC20Full.json";
import myERC721FullABI from "../abi/MyERC721Full.json";

import sampleContractABI from "../abi/SampleContract.json";

// Note: Under the current `tasit-contracts` setup the contracts always will deployed with these addresses
// See https://github.com/tasitlabs/TasitSDK/issues/138
const local = {
  SampleContract: {
    address: "0x6C4A015797DDDd87866451914eCe1e8b19261931",
    abi: sampleContractABI,
  },
  MyERC721Full: {
    address: "0x0E86f209729bf54763789CDBcA9E8b94f0FD5333",
    abi: myERC721FullABI,
  },
  MyERC20Full: {
    address: "0x37E1A58dD465D33263D00185D065Ee36DD34CDb4",
    abi: myERC20FullABI,
  },
  MANAToken: {
    address: "0xa6BAc51994B4993D0452e03F9f3106a66fEcA94F",
    abi: manaTokenABI,
  },
  EstateRegistry: {
    address: "0xB32939dA0c44BF255B9810421A55be095F9bB3f4",
    abi: estateRegistryABI,
  },
  LANDRegistry: {
    address: "0x332BfB4d705d3Ce37c4Bf06141c7104984e91E79",
    abi: landRegistryABI,
  },
  LANDProxy: {
    address: "0xB35420EEa0bC8af4F8A74414D080EA45f1EBf7bb",
    abi: landProxyABI,
  },
  Marketplace: {
    address: "0x1212F783f11611b0c029d5e6f86a23BE621669E0",
    abi: marketplaceABI,
  },
  GnosisSafe: {
    address: "0x07c0e972064e5C05F7B3596d81dE1AfD35457EaE",
    abi: gnosisSafeABI,
  },
};

const goerli = {
  MANAToken: {
    address: "0x0e86f209729bf54763789cdbca9e8b94f0fd5333",
    abi: manaTokenABI,
  },
  EstateRegistry: {
    address: "0xb32939da0c44bf255b9810421a55be095f9bb3f4",
    abi: estateRegistryABI,
  },
  LANDProxy: {
    address: "0xb35420eea0bc8af4f8a74414d080ea45f1ebf7bb",
    abi: landProxyABI,
  },
  LANDRegistry: {
    address: "0x332bfb4d705d3ce37c4bf06141c7104984e91e79",
    abi: landRegistryABI,
  },
  Marketplace: {
    address: "0x289c42facf691946b64b4370361b1303f0a463ef",
    abi: marketplaceABI,
  },
};

const ropsten = {
  EstateRegistry: {
    address: "0xb32939da0c44bf255b9810421a55be095f9bb3f4",
    abi: estateRegistryABI,
  },
  LANDProxy: {
    address: "0xb35420eea0bc8af4f8a74414d080ea45f1ebf7bb",
    abi: landProxyABI,
  },
  LANDRegistry: {
    address: "0x332bfb4d705d3ce37c4bf06141c7104984e91e79",
    abi: landRegistryABI,
  },
  MANAToken: {
    address: "0x0e86f209729bf54763789cdbca9e8b94f0fd5333",
    abi: manaTokenABI,
  },
  Marketplace: {
    address: "0x289c42facf691946b64b4370361b1303f0a463ef",
    abi: marketplaceABI,
  },
};

export const TasitContracts = {
  local,
  goerli,
  ropsten,
};

export default TasitContracts;
