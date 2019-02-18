const abi = require("../3rd-parties/gnosis/safe-contracts/build/contracts/GnosisSafe.json")
  .abi;
const localAddresses = require("../3rd-parties/gnosis/addresses").local;
const { GnosisSafe: contractAddress } = localAddresses;

// Note:
// This test suite is using web3.js because contract deployment is made by a 3rd-party repository
// (and most existing 3rd-party contracts tend to use Truffle which uses web3.js)
contract("GnosisSafe", function(accounts) {
  const GnosisSafe = new web3.eth.Contract(abi, contractAddress);
  const [ana, bob, carl] = accounts;

  it("should get the GnosisSafe name", async function() {
    const name = await GnosisSafe.methods.NAME().call();
    assert.equal(
      name,
      "Gnosis Safe",
      "'Gnosis Safe' isn't the GnosisSafe name."
    );
  });

  it("should get the GnosisSafe owner", async function() {
    const [owner] = await GnosisSafe.methods.getOwners().call();
    assert.equal(owner, ana, "Ana isn't the GnosisSafe owner.");
  });

  it.only("should deposit and withdraw 1 ETH", async function() {
    const balanceBeforeDeposit = await web3.eth.getBalance(contractAddress);
    assert.equal(balanceBeforeDeposit, 0);

    await web3.eth.sendTransaction({
      from: ana,
      to: contractAddress,
      value: web3.utils.toWei("1", "ether"),
    });

    const balanceAfterDeposit = await web3.eth.getBalance(contractAddress);
    assert.equal(balanceAfterDeposit, web3.utils.toWei("1", "ether"));
  });
});
