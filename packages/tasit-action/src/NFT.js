import Contract from "./Contract";

class ABIs {
  static getERC721Full = () => {
    // TODO: Is there a better way to do that for now?
    return require("./abi/ERC721Full.json");
  };
}

export class NFT extends Contract {
  #contract;

  constructor(address, wallet) {
    const abi = ABIs.getERC721Full();
    super(address, abi, wallet);
  }
}

export default NFT;
