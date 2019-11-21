import Contract from "../Contract";
import TasitContracts from "tasit-contracts";
const { local } = TasitContracts;
const { MANAToken } = local;
const { abi } = MANAToken;

const abiString = JSON.stringify(abi);

export default class Mana extends Contract {
  constructor(address: string, account) {
    super(address, abiString, account);
  }
}
