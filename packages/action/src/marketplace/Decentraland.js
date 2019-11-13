import Contract from "../contract/Contract";
import TasitContracts from "tasit-contracts";
const { local } = TasitContracts;
const { Marketplace } = local;
const { abi } = Marketplace;

export default class Decentraland extends Contract {
  constructor(address, account) {
    super(address, abi, account);
  }
}
