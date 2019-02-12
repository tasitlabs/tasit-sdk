import Contract from "../contract/Contract";
import marketplaceABI from "../abi/Marketplace.json";

export default class Decentraland extends Contract {
  constructor(address, wallet) {
    const abi = marketplaceABI;
    super(address, abi, wallet);
  }
}
