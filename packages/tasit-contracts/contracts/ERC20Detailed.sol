pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

contract DetailedERC20 is ERC20Detailed, ERC20Mintable {
  constructor() public ERC20Detailed("Detailed ERC20 Token", "DERC20", 18) {

  }
}
