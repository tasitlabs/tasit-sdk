import { Contract } from "tasit-action";

import TasitContracts from "../..";
const { local } = TasitContracts;
const { MyERC20Full } = local;
const { abi } = MyERC20Full;

const abiString = JSON.stringify(abi);

export default class ERC20Full extends Contract {
  constructor(address: string, account) {
    super(address, abiString, account);
  }
}
