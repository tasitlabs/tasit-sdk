import Contract from "../contract/Contract";
import abi from "../../../tasit-contracts/abi/MyERC721Full.json";

export default class ERC721Full extends Contract {
  constructor(address, wallet) {
    super(address, abi, wallet);
  }
}
