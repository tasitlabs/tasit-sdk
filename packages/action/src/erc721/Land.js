import Contract from "../contract/Contract";
import TasitContracts from "tasit-contracts";
const { local } = TasitContracts;
const { LANDRegistry } = local;
const { abi } = LANDRegistry;

export default class Land extends Contract {
  constructor(address, account) {
    super(address, abi, account);
  }
}
