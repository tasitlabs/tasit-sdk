import Contract from "./Contract";
import landRegistryABI from "./abi/LANDRegistry.json";

export default class DecentralandLand extends Contract {
  constructor(address, wallet) {
    const abi = landRegistryABI;
    super(address, abi, wallet);
  }
}
