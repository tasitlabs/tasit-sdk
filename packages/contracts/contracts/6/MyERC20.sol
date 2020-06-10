pragma solidity ^0.6.9;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";

contract MyERC20 is ERC20, ERC20Burnable {
  constructor() public ERC20("ERC20", "ERC20") {

  }
}
