import Contract from "../contract/Contract";
import TasitContracts from "tasit-contracts";
const { local } = TasitContracts;
const { MyERC721Full } = local;
const { abi } = MyERC721Full;

export default class ERC721Full extends Contract {
  constructor(address, wallet) {
    super(address, abi, wallet);
  }
}
