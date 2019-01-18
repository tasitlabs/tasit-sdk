pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol";

contract FullNFT is ERC721Full, ERC721Mintable {
  constructor() public ERC721Full("Full NFT", "FNFT") {

  }
}
