import ConfigLoader from "./ConfigLoader";
import Contract from "./contract/Contract";
import NFT from "./erc721/NFT";
import Land from "./erc721/Land";
import Decentraland from "./marketplace/Decentraland";
import Estate from "./erc721/Estate";
import Mana from "./erc20/Mana";

export { Contract, NFT, Land, Decentraland, Estate, Mana };

export const ERC20 = { Mana };
export const ERC721 = { Land, Estate, NFT };
export const Marketplace = { Decentraland };

export const TasitAction = {
  Contract,
  ConfigLoader,
  ERC20,
  ERC721,
  Marketplace,
};

export default TasitAction;
