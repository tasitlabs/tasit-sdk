import Contract from "../contract/Contract";
import abi from "../../../tasit-contracts/abi/ERC20Detailed.json";

export default class ERC20Detailed extends Contract {
  constructor(address, wallet) {
    super(address, abi, wallet);
  }
}
