const LANDRegistry = artifacts.require("./LANDRegistry.sol");
const EstateRegistry = artifacts.require("./EstateRegistry.sol");
const LANDProxy = artifacts.require("./LANDProxy.sol");

// Note: If you want to change this file, make sure that you are editing
// the original file inside of the `tasit-contracts/3rd-parties/decentraland/scripts`
module.exports = (deployer, network, accounts) => {
  [owner] = accounts;

  // Workaround to write async/await migration scripts
  // See more: https://github.com/trufflesuite/truffle/issues/501#issuecomment-332589663
  deployer.then(async () => {
    const estate = await deployer.deploy(EstateRegistry);
    const landRegistry = await deployer.deploy(LANDRegistry);
    const landProxy = await deployer.deploy(LANDProxy);

    const { address: ESTATE_ADDRESS } = estate;
    const { address: LAND_ADDRESS } = landRegistry;
    const { address: LAND_PROXY_ADDRESS } = landProxy;

    // Set Land ERC721 implementation to proxy
    await landProxy.upgrade(LAND_ADDRESS, owner);

    // Initialize Estate ERC721 contract
    const estateContractName = "Estate";
    const estateContractSymbol = "EST";
    await estate.initialize(
      estateContractName,
      estateContractSymbol,
      LAND_PROXY_ADDRESS
    );

    // Land Proxy contract with Land Regitry ABI
    const land = await LANDRegistry.at(LAND_PROXY_ADDRESS);
    await land.initialize(owner);
    await land.setEstateRegistry(ESTATE_ADDRESS);
  });
};
