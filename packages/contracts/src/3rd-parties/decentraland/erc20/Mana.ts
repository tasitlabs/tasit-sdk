import { Contract } from "tasit-action";

import TasitContracts from "../../..";
const { local } = TasitContracts;
const { MANAToken } = local;
const { abi } = MANAToken;

const abiString = JSON.stringify(abi);

export default class Mana extends Contract {
  constructor(address: string, account) {
    super(address, abiString, account);
  }
}
