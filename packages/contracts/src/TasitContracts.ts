// @ts-ignore semantic error TS6307
import estateRegistryABI from "../abi/EstateRegistry.json";
// @ts-ignore semantic error TS6307
import gnosisSafeABI from "../abi/GnosisSafe.json";

// @ts-ignore semantic error TS6307
import landProxyABI from "../abi/LANDProxy.json";
// @ts-ignore semantic error TS6307
import landRegistryABI from "../abi/LANDRegistry.json";
// @ts-ignore semantic error TS6307
import manaTokenABI from "../abi/MANAToken.json";
// @ts-ignore semantic error TS6307
import marketplaceABI from "../abi/Marketplace.json";

// @ts-ignore semantic error TS6307
import myERC20FullABI from "../abi/MyERC20Full.json";
// @ts-ignore semantic error TS6307
import myERC721FullABI from "../abi/MyERC721Full.json";

// @ts-ignore semantic error TS6307
import sampleContractABI from "../abi/SampleContract.json";

// Note: Under the current `tasit-contracts` setup the contracts always will deployed with these addresses
// See https://github.com/tasitlabs/tasit-sdk/issues/138
const local = {
  SampleContract: {
    address: "0x5e1cEBbbF763093e900c280dBe688363d98c660B",
    abi: sampleContractABI,
  },
  MyERC721Full: {
    address: "0xd3A840fDfecE8C7Eb38FE900D588584D4da92785",
    abi: myERC721FullABI,
  },
  MyERC20Full: {
    address: "0xd9D3960AbD6681c85cE3f6fE502F7C0d86343C6E",
    abi: myERC20FullABI,
  },
  MANAToken: {
    address: "0xb118A8Ca918330c1a1dCa29E455278bB1CfdfB29",
    abi: manaTokenABI,
  },
  EstateRegistry: {
    address: "0x5Cd28BD27f230D1a61f5aEef19d2190CfB3185FE",
    abi: estateRegistryABI,
  },
  LANDRegistry: {
    address: "0x45cbe274F6fe3F32A08e8249de72a79989F6bF8D",
    abi: landRegistryABI,
  },
  LANDProxy: {
    address: "0x9eA8B4A4BceDF3b683d3aC34325F41b662972052",
    abi: landProxyABI,
  },
  Marketplace: {
    address: "0x8E91a85ce94430f83d81eAcCd3c018727e86bba0",
    abi: marketplaceABI,
  },
  GnosisSafe: {
    address: "0x788BAFE1c0Fc303213B8a954dE9EF07C2420Bf64",
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
    address: "0x45cbe274F6fe3F32A08e8249de72a79989F6bF8D",
    abi: estateRegistryABI,
  },
  LANDProxy: {
    address: "0xDbeaFBF0B082DF01f053761a5A11d9F10209056D",
    abi: landProxyABI,
  },
  LANDRegistry: {
    address: "0x9eA8B4A4BceDF3b683d3aC34325F41b662972052",
    abi: landRegistryABI,
  },
  MANAToken: {
    address: "0x5Cd28BD27f230D1a61f5aEef19d2190CfB3185FE",
    abi: manaTokenABI,
  },
  Marketplace: {
    address: "0x74bFF5B8BaDd62DCf39E58216D23E03bA953cAe3",
    abi: marketplaceABI,
  },
  GnosisSafe: {
    address: "0xdF1108C839686f28b5010a1784a07262aA447722",
    abi: gnosisSafeABI,
  },
};

export const TasitContracts = {
  local,
  goerli,
  ropsten,
};

export default TasitContracts;
