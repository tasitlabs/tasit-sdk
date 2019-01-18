import Contract from "./Contract";

class ABIs {
  static getERC721Full = () => {
    // TODO: Is there a better way to do that for now?
    return require("./abi/ERC721Full.json");
  };
}

export class NFT {
  #contract;
  #abi;

  constructor(address, wallet) {
    this.#abi = ABIs.getERC721Full();
    this.#contract = new Contract(address, this.#abi, wallet);
    this.#addFunctionsToNFT();
  }

  getAddress = () => {
    return this.#contract.getAddress();
  };

  subscribe = () => {
    return this.#contract.subscribe();
  };

  #addFunctionsToNFT = () => {
    this.#abi
      .filter(json => {
        return json.type === "function";
      })
      .forEach(f => {
        this[f.name] = this.#contract[f.name];
      });
  };

  // For testing purposes
  getProvider = () => {
    return this.#contract.getProvider();
  };
}

export default NFT;
