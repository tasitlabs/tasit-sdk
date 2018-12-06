pragma solidity ^0.4.24;

contract SimpleStorage {
  event ValueChanged(address indexed author, string oldValue, string newValue);

  string _value;

  constructor(string value) public {
    emit ValueChanged(msg.sender, _value, value);
    _value = value;
  }

  function getValue() public view returns(string) {
    return _value;
  }

  function setValue(string value) public {
    emit ValueChanged(msg.sender, _value, value);
    _value = value;
  }
}
