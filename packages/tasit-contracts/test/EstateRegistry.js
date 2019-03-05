const TasitContracts = require("../dist/TasitContracts").TasitContracts;
const { local } = TasitContracts;
const { EstateRegistry, LANDRegistry } = local;
const {
  address: ESTATE_REGISTRY_ADDRESS,
  abi: estateRegistryABI,
} = EstateRegistry;
const { address: LAND_REGISTRY_ADDRESS } = LANDRegistry;

// Note:
// This test suite is using web3.js because contract deployment is made by a 3rd-party repository
// (and most existing 3rd-party contracts tend to use Truffle which uses web3.js)
contract("EstateRegistry", accounts => {
  const [owner] = accounts;

  const gasParams = { gas: 7e6, gasPrice: 1e9 };

  it("should initialize and get the EstateRegistry name", async () => {
    const estateRegistry = new web3.eth.Contract(
      estateRegistryABI,
      ESTATE_REGISTRY_ADDRESS
    );

    await estateRegistry.methods
      .initialize("Estate", "EST", LAND_REGISTRY_ADDRESS)
      .send({ from: owner, ...gasParams });

    let name = await estateRegistry.methods.name().call();

    assert.equal(
      name,
      "Estate",
      "Estate isn't the EstateRegistry totalSupply."
    );
  });
});
