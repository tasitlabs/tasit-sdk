const TasitContracts = require("../dist/TasitContracts").TasitContracts;
const { local } = TasitContracts;
const { LANDProxy } = local;
const { address, abi } = LANDProxy;

// Note:
// This test suite is using web3.js because contract deployment is made by a 3rd-party repository
// (and most existing 3rd-party contracts tend to use Truffle which uses web3.js)
contract("LANDProxy", accounts => {
  const [CONTRACT_OWNER] = accounts;

  it("should get the LANDProxy owner", async () => {
    const landProxy = new web3.eth.Contract(abi, address);

    const owner = await landProxy.methods.owner().call();

    assert.equal(
      owner,
      CONTRACT_OWNER,
      "CONTRACT_OWNER isn't the LANDProxy owner."
    );
  });
});
