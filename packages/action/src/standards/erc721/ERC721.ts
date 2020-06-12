import Contract from "../../contract";

import TasitContracts from "@tasit/contracts";
const { local } = TasitContracts;
const { MyERC721 } = local;
const { abi } = MyERC721;

const abiString = JSON.stringify(abi);

export default class ERC721Full extends Contract {
  constructor(address: string, account) {
    super(address, abiString, account);
  }
}
