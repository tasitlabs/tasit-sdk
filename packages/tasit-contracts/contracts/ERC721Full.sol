pragma solidity ^0.5.0;

import {ERC721Full as OpenzeppelinERC721Full} from "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol";

contract ERC721Full is OpenzeppelinERC721Full, ERC721Mintable {
  constructor() public OpenzeppelinERC721Full("ERC721Full", "ERC721") {

  }
}
