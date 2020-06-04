pragma solidity ^0.6.8;

// SPDX-License-Identifier: MIT

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

contract MyERC20Full is ERC20, ERC20Burnable {
  constructor() public ERC20("ERC20", "ERC20") {

  }
}
