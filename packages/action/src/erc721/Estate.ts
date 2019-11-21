import Contract from "../contract/Contract";
import TasitContracts from "tasit-contracts";
const { local } = TasitContracts;
const { EstateRegistry } = local;
const { abi } = EstateRegistry;

const abiString = JSON.stringify(abi);

export default class DecentralandEstate extends Contract {
  constructor(address: string, account) {
    super(address, abiString, account);
  }
}
