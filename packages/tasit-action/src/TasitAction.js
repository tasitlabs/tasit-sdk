import ConfigLoader from "./ConfigLoader";
import Contract from "./contract/Contract";
import ERC721Full from "./erc721/ERC721Full";
import Land from "./erc721/Land";
import Decentraland from "./marketplace/Decentraland";
import Estate from "./erc721/Estate";
import Mana from "./erc20/Mana";
import ERC20Detailed from "./erc20/ERC20Detailed";

export { Contract, ERC721Full, Land, Decentraland, Estate, Mana };

export const ERC20 = { Mana, ERC20Detailed };
export const ERC721 = { Land, Estate, ERC721Full };
export const Marketplace = { Decentraland };

export const TasitAction = {
  Contract,
  ConfigLoader,
  ERC20,
  ERC721,
  Marketplace,
};

export default TasitAction;
