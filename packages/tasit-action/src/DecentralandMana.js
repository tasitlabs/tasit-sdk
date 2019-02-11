import Contract from "./Contract";
import manaTokenABI from "./abi/MANAToken.json";

export default class DecentralandMana extends Contract {
  #contract;

  constructor(address, wallet) {
    const abi = manaTokenABI;
    super(address, abi, wallet);
  }
}
