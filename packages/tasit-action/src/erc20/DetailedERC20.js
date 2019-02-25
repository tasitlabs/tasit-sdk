import Contract from "../contract/Contract";
import detailedERC20ABI from "../../../tasit-contracts/abi/DetailedERC20.json";

export default class DetailedERC20 extends Contract {
  constructor(address, wallet) {
    const abi = detailedERC20ABI;
    super(address, abi, wallet);
  }
}
