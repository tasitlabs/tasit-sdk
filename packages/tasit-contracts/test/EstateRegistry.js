const TasitContracts = require("../dist/TasitContracts").TasitContracts;
const { local } = TasitContracts;
const { EstateRegistry } = local;
const { abi, address } = EstateRegistry;

// Note:
// This test suite is using web3.js because contract deployment is made by a 3rd-party repository
// (and most existing 3rd-party contracts tend to use Truffle which uses web3.js)
contract("EstateRegistry", accounts => {
  const [owner] = accounts;

  it("should the EstateRegistry contract name", async () => {
    const estateRegistry = new web3.eth.Contract(abi, address);

    let name = await estateRegistry.methods.name().call();

    assert.equal(
      name,
      "Estate",
      "Estate isn't the EstateRegistry totalSupply."
    );
  });
});
