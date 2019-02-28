pragma solidity ^0.5.0;

import {ERC20Detailed as OpenzeppelinERC20Detailed} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

contract ERC20Detailed is OpenzeppelinERC20Detailed, ERC20Mintable {
  constructor(

  ) public OpenzeppelinERC20Detailed("ERC20Detailed Token", "ERC20", 18) {

  }
}
