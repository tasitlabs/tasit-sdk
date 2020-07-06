pragma solidity ^0.6.10;

// SPDX-License-Identifier: MIT

contract SampleContract {
  event ValueChanged(address indexed author, string oldValue, string newValue);
  event ValueRemoved(address indexed author, string oldValue);

  string _value;

  constructor(string memory value) public {
    emit ValueChanged(msg.sender, _value, value);
    _value = value;
  }

  function getValue() public view returns(string memory) {
    return _value;
  }

  function setValue(string memory value) public {
    emit ValueChanged(msg.sender, _value, value);
    _value = value;
  }

  function removeValue() public {
    emit ValueRemoved(msg.sender, _value);
    _value = "";
  }

  function revertRead() public pure returns(bool) {
    require(false);
    return false;
  }

  function revertWrite(string memory value) public {
    require(false);
    _value = value;
  }

  function overloading() public pure returns(uint) {
    return 1;
  }

  function overloading(string memory a) public pure returns(uint) {
    return 2;
  }

  function overloading(string memory a, string memory b) public pure returns(
    uint
  ) {
    return 3;
  }

}
