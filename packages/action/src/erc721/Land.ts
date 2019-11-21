import Contract from "../contract/Contract";
import TasitContracts from "tasit-contracts";
const { local } = TasitContracts;
const { LANDRegistry } = local;
const { abi } = LANDRegistry;

const abiString = JSON.stringify(abi);

export default class Land extends Contract {
  constructor(address: string, account) {
    super(address, abiString, account);
  }
}
