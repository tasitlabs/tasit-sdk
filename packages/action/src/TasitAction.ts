import ConfigLoader from "./ConfigLoader";

import Action from "./action";
import ProviderFactory from "./ProviderFactory";

import Contract from "./contract";
import standards from "./standards";
import Utils from "./contract/Utils";

export { Contract };

export const TasitAction = {
  Contract,
  ConfigLoader,
  Action,
  Utils,
  ProviderFactory,
  standards
};

export default TasitAction;
