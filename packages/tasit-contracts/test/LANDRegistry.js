const TasitContracts = require("../dist/TasitContracts").TasitContracts;
const { local } = TasitContracts;
const { LANDRegistry } = local;
const { address, abi } = LANDRegistry;

// Note:
// This test suite is using web3.js because contract deployment is made by a 3rd-party repository
// (and most existing 3rd-party contracts tend to use Truffle which uses web3.js)
contract("LANDRegistry", accounts => {
  const [CONTRACT_OWNER] = accounts;

  it("should get the LANDRegistry owner", async () => {
    const landRegistry = new web3.eth.Contract(abi, address);

    const owner = await landRegistry.methods.owner().call();

    assert.equal(
      owner,
      CONTRACT_OWNER,
      "CONTRACT_OWNER isn't the LANDRegistry owner."
    );
  });
});
