usePlugin("@nomiclabs/buidler-waffle");

// This is a sample Buidler task. To learn how to create your own go to
// https://buidler.dev/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.getAddress());
  }
});

// You have to export an object to set up your config
// This object can have the following optional entries:
// defaultNetwork, networks, solc, and paths.
// Go to https://buidler.dev/config/ to learn more
module.exports = {
  // This is a sample solc configuration that specifies which version of solc to use
  solc: {
    // Default evm version should be greater than `byzantium`
    // for the create2 opcode to be available
    // even though Gnosis Safe contracts say ^0.5.3
    // Could also have specified a non-default
    // evm version while still using 0.5.3, but that
    // seems like it could create more problems than it
    // solves
    version: "0.5.10",
  },
  paths: {
    sources: "./contracts/5",
  }
};
