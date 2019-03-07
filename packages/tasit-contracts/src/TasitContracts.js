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
  MyERC20Full: {
    address: "0x37E1A58dD465D33263D00185D065Ee36DD34CDb4",
    abi: myERC20FullABI,
  },
  MyERC721Full: {
    address: "0x0E86f209729bf54763789CDBcA9E8b94f0FD5333",
    abi: myERC721FullABI,
  },
  SampleContract: {
    address: "0x6C4A015797DDDd87866451914eCe1e8b19261931",
    abi: sampleContractABI,
  },
  MANAToken: {
    address: "0x332bfb4d705d3ce37c4bf06141c7104984e91e79",
    abi: manaTokenABI,
  },
  EstateRegistry: {
    address: "0x6191bc768c2339da9eab9e589fc8bf0b3ab80975",
    abi: estateRegistryABI,
  },
  LANDProxy: {
    address: "0x1212f783f11611b0c029d5e6f86a23be621669e0",
    abi: landProxyABI,
  },
  LANDRegistry: {
    address: "0x773f11ed472aa43e4ebaa963bcfbbea5a10c1bbd",
    abi: landRegistryABI,
  },
  Marketplace: {
    address: "0x2b3f477b0b056e91b8a389a904f2b6e1a9c00266",
    abi: marketplaceABI,
  },
  GnosisSafe: {
    address: "0x085144ea669dba7637f3a7c7e7a4030b090ce23e",
    abi: gnosisSafeABI,
  },
};

import decentralandAddresses from "../3rd-parties/decentraland/contracts/addresses.json";
const { ropsten: decentralandRopstenAddresses } = decentralandAddresses;
const {
  EstateProxy: ROPSTEN_ESTATE_REGISTRY_PROXY_ADDRESS,
  EstateRegistry: ROPSTEN_ESTATE_REGISTRY_ADDRESS,
  LANDProxy: ROPSTEN_LAND_PROXY_ADDRESS,
  LANDRegistry: ROPSTEN_LAND_REGISTRY_ADDRESS,
  MANAToken: ROPSTEN_MANA_TOKEN_ADDRESS,
  MarketplaceProxy: ROPSTEN_MARKETPLACE_PROXY_ADDRESS,
  Marketplace: ROPSTEN_MARKETPLACE_ADDRESS,
} = decentralandRopstenAddresses;

const ropsten = {
  EstateProxy: {
    address: ROPSTEN_ESTATE_REGISTRY_PROXY_ADDRESS,
    abi: estateRegistryABI,
  },
  EstateRegistry: {
    address: ROPSTEN_ESTATE_REGISTRY_ADDRESS,
    abi: estateRegistryABI,
  },
  LANDProxy: {
    address: ROPSTEN_LAND_PROXY_ADDRESS,
    abi: landProxyABI,
  },
  LANDRegistry: {
    address: ROPSTEN_LAND_REGISTRY_ADDRESS,
    abi: landRegistryABI,
  },
  MANAToken: {
    address: ROPSTEN_MANA_TOKEN_ADDRESS,
    abi: manaTokenABI,
  },
  Marketplace: {
    address: ROPSTEN_MARKETPLACE_ADDRESS,
    abi: marketplaceABI,
  },
  MarketplaceProxy: {
    address: ROPSTEN_MARKETPLACE_PROXY_ADDRESS,
    abi: marketplaceABI,
  },
};

export const TasitContracts = {
  local,
  ropsten,
};

export default TasitContracts;
