const Marketplace = artifacts.require("./Marketplace.sol");
const { TasitContracts } = require("../dist/TasitContracts");

module.exports = (deployer, network, accounts) => {
  [owner] = accounts;
  const { network_id } = deployer;
  const { local, goerli } = TasitContracts;
  const blockchain = network_id == 5 ? goerli : local;
  const { MANAToken, EstateRegistry } = blockchain;
  const { address: MANA_ADDRESS } = MANAToken;
  const { address: ESTATE_ADDRESS } = EstateRegistry;

  // Workaround to write async/await migration scripts
  // See more: https://github.com/trufflesuite/truffle/issues/501#issuecomment-332589663
  deployer.then(async () => {
    const marketplace = await deployer.deploy(Marketplace);
    await marketplace.methods["initialize(address,address,address)"](
      MANA_ADDRESS,
      ESTATE_ADDRESS,
      owner
    );
  });
};
