import estateRegistryABI from "../abi/EstateRegistry.json";
import gnosisSafeABI from "../abi/GnosisSafe.json";
import landProxyABI from "../abi/LANDProxy.json";
import landRegistryABI from "../abi/LANDRegistry.json";
import manaTokenABI from "../abi/MANAToken.json";
import marketplaceABI from "../abi/Marketplace.json";
import myERC20FullABI from "../abi/MyERC20Full.json";
import myERC721FullABI from "../abi/MyERC721Full.json";
import sampleContractABI from "../abi/SampleContract.json";

const local = {
  EstateRegistry: {
    address: "0x6191bc768c2339da9eab9e589fc8bf0b3ab80975",
    abi: estateRegistryABI,
  },
  GnosisSafe: {
    address: "0x9a4a2e7ed3ee6d481624f5392d8c6169c62065b7",
    abi: gnosisSafeABI,
  },
  LANDProxy: {
    address: "0x1212f783f11611b0c029d5e6f86a23be621669e0",
    abi: landProxyABI,
  },
  LANDRegistry: {
    address: "0x773f11ed472aa43e4ebaa963bcfbbea5a10c1bbd",
    abi: landRegistryABI,
  },
  MANAToken: {
    address: "0x332bfb4d705d3ce37c4bf06141c7104984e91e79",
    abi: manaTokenABI,
  },
  Marketplace: {
    address: "0x70960e803a2bbe90c7db34edfdc2d1e81ed46b79",
    abi: marketplaceABI,
  },
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
};

import decentralandAddresses from "../3rd-parties/decentraland/contracts/addresses.json";
const { ropsten: decentralandRopstenAddresses } = decentralandAddresses;
const {
  EstateRegistry: ROPSTEN_ESTATE_REGISTRY_ADDRESS,
  LANDProxy: ROPSTEN_LAND_PROXY_ADDRESS,
  LANDRegistry: ROPSTEN_LAND_REGISTRY_ADDRESS,
  MANAToken: ROPSTEN_MANA_TOKEN_ADDRESS,
  Marketplace: ROPSTEN_MARKETPLACE_ADDRESS,
} = decentralandRopstenAddresses;

const ropsten = {
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
};

export const TasitContracts = {
  local,
  ropsten,
};

export default TasitContracts;
