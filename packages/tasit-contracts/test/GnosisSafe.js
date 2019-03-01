const TasitContracts = require("../dist/TasitContracts").TasitContracts;
const { local } = TasitContracts;
const { GnosisSafe } = local;
const { address, abi } = GnosisSafe;

// Note:
// This test suite is using web3.js because contract deployment is made by a 3rd-party repository
// (and most existing 3rd-party contracts tend to use Truffle which uses web3.js)
contract("GnosisSafe", accounts => {
  const gnosisSafe = new web3.eth.Contract(abi, address);
  const jonh = accounts[9];

  it("should get the GnosisSafe name", async function() {
    const name = await gnosisSafe.methods.NAME().call();
    assert.equal(name, "Gnosis Safe", "'Gnosis Safe' isn't the contract name.");
  });

  it("should get the GnosisSafe owner", async () => {
    const [owner] = await gnosisSafe.methods.getOwners().call();
    assert.equal(owner, jonh, "John isn't the contract owner.");
  });
});
