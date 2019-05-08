import Contract from "../contract/Contract";
import TasitContracts from "tasit-contracts";
const { local } = TasitContracts;
const { EstateRegistry } = local;
const { abi } = EstateRegistry;

export default class DecentralandEstate extends Contract {
  constructor(address, account) {
    super(address, abi, account);
  }
}
