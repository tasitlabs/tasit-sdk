import Contract from "../contract/Contract";
import TasitContracts from "tasit-contracts";
const { local } = TasitContracts;
const { Marketplace } = local;
const { abi } = Marketplace;

const abiString = JSON.stringify(abi);

export default class Decentraland extends Contract {
  constructor(address: string, account) {
    super(address, abiString, account);
  }
}
