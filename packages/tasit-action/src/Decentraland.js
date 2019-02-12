import Contract from "./Contract";
import marketplaceABI from "./abi/Marketplace.json";

export default class DecentralandMarketplace extends Contract {
  constructor(address, wallet) {
    const abi = marketplaceABI;
    super(address, abi, wallet);
  }
}
