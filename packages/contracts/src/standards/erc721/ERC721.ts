import { Contract } from "tasit-action";

import TasitContracts from "../..";
const { local } = TasitContracts;
const { MyERC721 } = local;
const { abi } = MyERC721;

const abiString = JSON.stringify(abi);

export default class ERC721Full extends Contract {
  constructor(address: string, account) {
    super(address, abiString, account);
  }
}
