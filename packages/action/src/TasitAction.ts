import ConfigLoader from "./ConfigLoader";

import Action from "./action";

import Contract from "./contract";
import Utils from "./contract/Utils";

import ERC20Full from "./contract/erc20/ERC20Full";
import Mana from "./contract/erc20/Mana";

import ERC721Full from "./contract/erc721/ERC721Full";
import Land from "./contract/erc721/Land";
import Estate from "./contract/erc721/Estate";

import Decentraland from "./contract/marketplace/Decentraland";

export { Contract, ERC721Full, Land, Decentraland, Estate, Mana };

export const ERC20 = { Mana, ERC20Full };
export const ERC721 = { Land, Estate, ERC721Full };
export const Marketplace = { Decentraland };

export const TasitAction = {
  Contract,
  ConfigLoader,
  ERC20,
  ERC721,
  Marketplace,
  Action,
  Utils,
};

export default TasitAction;
