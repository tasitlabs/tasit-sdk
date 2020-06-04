pragma solidity ^0.6.8;

// SPDX-License-Identifier: MIT

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract MyERC721 is ERC721 {
  constructor() public ERC721("ERC721", "ERC721") {

  }
}
