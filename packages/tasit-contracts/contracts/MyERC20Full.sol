pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

contract MyERC20Full is ERC20Detailed, ERC20Mintable, ERC20Burnable {
  constructor() public ERC20Detailed("ERC20Full", "ERC20", 18) {

  }
}
