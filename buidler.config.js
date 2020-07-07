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
    version: "0.6.9",
  },
  networks: {
    "buidlerevm": {
      // Note: Also hardcoding these in @tasit/account package.
      // TODO: Use shared constants from one spot
      // Or just add buidler as a dev dep in each child package that needs
      // a blockchain
      // But then making sure all of the necessary contracts are compiled in
      // each separate buidler evm doesn't seem ideal
      accounts: [
        {
          privateKey: "0x02380f59eeed7a02557aeaab089606739feb0e1db34c6b08374ad31188a3892d",
          balance: "0x420100000000000000"
        },
        {
          privateKey: "0x2232aa52d058352511c5dd2d0ebcc0cfb6dfb5f051a9b367b7505556d2672490",
          balance: "0x420100000000000"
        },
        {
          privateKey: "0x573862e2beaa8dcaf00094c7a56dcb81bcf82c83fc1bb0f9292d6cd656db45df",
          balance: "0x420100000000000"
        },
        {
          privateKey: "0xcc51b0d7bb32d222416bfd885498659a9270a1790ba0fcb1771a5fd20507ffa9",
          balance: "0x420100000000000"
        },
        {
          privateKey: "0x1fed0a74c3c287f5c93479ff5ba60e1a32974d49425bd6d596ecd0b0f77e0352",
          balance: "0x420100000000000"
        },
        {
          privateKey: "0x9f071322c7c55e5d8b7e9778788e798384371c5ec716c60614dd7db009947e18",
          balance: "0x420100000000000"
        },
        {
          privateKey: "0xa6d4b9724775bbc5541158ad69e6428af60e5f2251d0bf8fd3e8ab7efa12ee93",
          balance: "0x420100000000000"
        },
        {
          privateKey: "0xe1ba62dfb842495d59579dfca29e212ceb78818af7c5869623317fc46dd1a5bf",
          balance: "0x420100000000000"
        },
        {
          privateKey: "0xda1a8c477afeb99ae2c2300b22ad612ccf4c184564e332ae9a32f784bbca8d6b",
          balance: "0x420100000000000"
        },
        {
          privateKey: "0x633a290bcdabb9075c5a4b3885c69ce64b4b0e6079eb929abb2ac9427c49733b",
          balance: "0x420100000000000"
        }
      ]
    }
  }
};
