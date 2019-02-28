import Contract from "../contract/Contract";
import abi from "../../../tasit-contracts/abi/MyERC20Full.json";

export default class ERC20Full extends Contract {
  constructor(address, wallet) {
    super(address, abi, wallet);
  }
}
