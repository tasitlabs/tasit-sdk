import Contract from "../contract/Contract";
import landRegistryABI from "../../../tasit-contracts/abi/LANDRegistry.json";

export default class Land extends Contract {
  constructor(address, wallet) {
    const abi = landRegistryABI;
    super(address, abi, wallet);
  }
}
