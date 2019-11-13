const MANAToken = artifacts.require("./MANAToken.sol");
const LANDRegistry = artifacts.require("./LANDRegistry.sol");
const EstateRegistry = artifacts.require("./EstateRegistry.sol");
const LANDProxy = artifacts.require("./LANDProxy.sol");
const Marketplace = artifacts.require("./Marketplace.sol");

module.exports = (deployer, network, accounts) => {
  [owner] = accounts;

  // Workaround to write async/await migration scripts
  // See more: https://github.com/trufflesuite/truffle/issues/501#issuecomment-332589663
  deployer.then(async () => {
    const mana = await deployer.deploy(MANAToken);
    const estate = await deployer.deploy(EstateRegistry);
    const landRegistry = await deployer.deploy(LANDRegistry);
    const landProxy = await deployer.deploy(LANDProxy);

    const { address: MANA_ADDRESS } = mana;
    const { address: ESTATE_ADDRESS } = estate;
    const { address: LAND_ADDRESS } = landRegistry;
    const { address: LAND_PROXY_ADDRESS } = landProxy;

    // Set Land ERC721 implementation to proxy
    await landProxy.upgrade(LAND_ADDRESS, owner);

    // Initialize Estate ERC721 contract
    const estateContractName = "Estate";
    const estateContractSymbol = "EST";
    await estate.methods["initialize(string,string,address)"](
      estateContractName,
      estateContractSymbol,
      LAND_PROXY_ADDRESS
    );

    // Land Proxy contract with Land Registry ABI
    const land = await LANDRegistry.at(LAND_PROXY_ADDRESS);
    await land.initialize(owner);
    await land.setEstateRegistry(ESTATE_ADDRESS);

    // Initialize Marketplace
    const marketplace = await deployer.deploy(Marketplace);
    await marketplace.methods["initialize(address,address,address)"](
      MANA_ADDRESS,
      ESTATE_ADDRESS,
      owner
    );
  });
};
