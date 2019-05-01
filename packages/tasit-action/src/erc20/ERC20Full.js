import Contract from "../contract/Contract";
import TasitContracts from "tasit-contracts";
const { local } = TasitContracts;
const { MyERC20Full } = local;
const { abi } = MyERC20Full;

export default class ERC20Full extends Contract {
  constructor(address, wallet) {
    super(address, abi, wallet);
  }
}
