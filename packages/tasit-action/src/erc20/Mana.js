import Contract from "../contract/Contract";
import TasitContracts from "tasit-contracts";
const { local } = TasitContracts;
const { MANAToken } = local;
const { abi } = MANAToken;

export default class Mana extends Contract {
  constructor(address, account) {
    super(address, abi, account);
  }
}
