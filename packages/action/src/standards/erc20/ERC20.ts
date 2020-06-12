import Contract from "../../contract";

import TasitContracts from "@tasit/contracts";
const { local } = TasitContracts;
const { MyERC20 } = local;
const { abi } = MyERC20;
// const { type } = MyERC20;
// TODO: Type use the Type for MyErc20 somehow

const abiString = JSON.stringify(abi);

export default class ERC20 extends Contract {
  // TODO: Decide whether to manually type the ERC20 methods here or leverage
  // TypeChain somehow
  // name() {
  //   throw new Error("Method not implemented.");
  // }
  constructor(address: string, account?) {
    // TODO: Decide whether to use TypeChain-generated contract factory here
    // and make sure it's bundled in what @tasit/contracts exports
    // rather than using super directly so that
    // an ERC20 method like "name" will be avaible for the type
    super(address, abiString, account);
  }
}
