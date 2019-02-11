import Contract from "./Contract";
import estateRegistryABI from "./abi/EstateRegistry.json";

export default class DecentralandEstate extends Contract {
  #contract;

  constructor(address, wallet) {
    const abi = estateRegistryABI;
    super(address, abi, wallet);
  }
}
