import ConfigLoader from "./ConfigLoader";
import Contract from "./contract/Contract";
import NFT from "./erc721/NFT";
import Land from "./erc721/Land";
import Decentraland from "./marketplace/Decentraland";
import Estate from "./erc721/Estate";
import Mana from "./erc20/Mana";
import DetailedERC20 from "./erc20/DetailedERC20";

export { Contract, NFT, Land, Decentraland, Estate, Mana };

export const ERC20 = { Mana, DetailedERC20 };
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
