import Contract from "../Contract";
import TasitContracts from "tasit-contracts";
const { local } = TasitContracts;
const { MyERC721Full } = local;
const { abi } = MyERC721Full;

const abiString = JSON.stringify(abi);

export default class ERC721Full extends Contract {
  constructor(address: string, account) {
    super(address, abiString, account);
  }
}
