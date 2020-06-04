import { Contract } from "tasit-action";

import TasitContracts from "../..";
const { local } = TasitContracts;
const { MyERC721Full } = local;
const { abi } = MyERC721Full;

const abiString = JSON.stringify(abi);

export default class ERC721Full extends Contract {
  constructor(address: string, account) {
    super(address, abiString, account);
  }
}
