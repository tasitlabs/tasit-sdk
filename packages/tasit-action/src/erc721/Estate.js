import Contract from "../contract/Contract";
import estateRegistryABI from "../abi/EstateRegistry.json";

export default class DecentralandEstate extends Contract {
  constructor(address, wallet) {
    const abi = estateRegistryABI;
    super(address, abi, wallet);
  }
}
