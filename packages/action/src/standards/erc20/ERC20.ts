import { Contract } from "@tasit/action";

import TasitContracts from "../..";
const { local } = TasitContracts;
const { MyERC20 } = local;
const { abi } = MyERC20;

const abiString = JSON.stringify(abi);

export default class ERC20 extends Contract {
  constructor(address: string, account) {
    super(address, abiString, account);
  }
}
