import Contract from "./Contract";
import erc721FullABI from "./abi/ERC721Full.json";

export default class NFT extends Contract {
  #contract;

  constructor(address, wallet) {
    const abi = erc721FullABI;
    super(address, abi, wallet);
  }
}
