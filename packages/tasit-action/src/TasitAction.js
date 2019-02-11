import ConfigLoader from "./ConfigLoader";
import Contract from "./Contract";
import NFT from "./NFT";
import DecentralandLand from "./DecentralandLand";
import DecentralandMarketplace from "./DecentralandMarketplace";
import DecentralandEstate from "./DecentralandEstate";
import DecentralandMana from "./DecentralandMana";

export {
  Contract,
  NFT,
  DecentralandLand,
  DecentralandMarketplace,
  DecentralandEstate,
  DecentralandMana,
};

export const TasitAction = {
  NFT,
  Contract,
  ConfigLoader,
  DecentralandLand,
  DecentralandMarketplace,
  DecentralandEstate,
  DecentralandMana,
};

export default TasitAction;
