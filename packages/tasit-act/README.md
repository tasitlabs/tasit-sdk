This explains how one might interact with smart contracts at different levels of abstraction using tasit-act

### Notes

Getting data is like an HTTP request, so it should be async. Because doing the JSON-RPC request to Infura and getting data back has network lag.

Setting data could possibly be non-async if it's like publishing in pubsub.

Then you subscribe for the data like it's pubsub as well. That would make subscribing to the "event" of 1 or 7 or 100 block confirmations for a set operation have a very similar API to the one for subscribing to events.

[Getting data](#getting-data)
[Setting data](#setting-data)
[Listening for events](#listening-for-events)

### Getting data

##### Decentraland

I think at this level of abstraction, we don't use ERC165 interface detection like we do at lower levels (see below). But actually, using it at all warrants more thought, depending on whether we're assuming the user knows the full contract ABI or not (and depending on whether ethers.js assumes that.)

We just know the ABI for the open source contracts for that exact project and assume the presence of these functions. The developer can still use the lower-level APIs to confirm, though.

```
import { Decentraland } from tasit-act

// We already know what would have normally been the params here
// (contractABI, address, etc.)
const decentraland = new Decentraland()
```

Low-level functions still work

```
const balance = await decentraland.balanceOf(owner)
```

Optional: Expose higher-level functions that are specific to this dapp

```
// This is not necessarily the name of the function in the contracts
// but whatever we think would be simplest for the developer using this
const [x, y] = await decentraland.getLandCoordinates(landId)
```

```
// Decentraland has some land owned by estates which are owned by users
// and some land owned directly by users
// You might want to get all the land a user owns even if they have it
// inside an estate. Now we're getting past the standard ERC721 functionality
// and supporting features specific to Decentraland

const landIds = decentraland.getAllLandIdsIncludingEstates(userId)
```

All of this could be done with a little more work using just the ERC721 abstraction, below, though.

Open questions:

- Whether the address should be configurable at this level of abstraction. For instance, the developer using this SDK might know sooner than the Tasit SDK project core devs do that non-upgradable contract project is deploying new contracts and will be using a new interface address from now on.
- Whether the ABI should be in version control in this package or whether we want to add functionality for getting it from the web, using Etherscan's API or hopefully a decentralized npm where teams publish generated files like ABIs down the road.

##### ERC 721

A higher-level API focused on ERC721. There's functionanlity for infering what it can above optional ERC721 features using ERC165 interface detection.

```
// TODO: Decide how to instantiate it
const nft = new NFT(address, contractABI)

// detectInterfaces returns an object of ERC721-related interfaces it supports
// Internally it calls the lower level
// contract.supportsInterface() first.
const { supportsMetadata } = await nft.detectInterfaces()

if (supportsMetadata) {
  const metadata = await nft.getMetadata()
  const { tokenURI } = metadata // metadata also contains name and symbol
}

// Alternatively, because tokenURI is just an external or public view function
// you can get it directly using the underlying contract method approach
// you'll see used exclusively below
const tokenURI = await nft.tokenURI(tokenId)
```

##### tasit-act

A low-level way for calling all of the functions on a given smart contract

To make this example comparable with the ERC721 example above, let's say the contract happens to be of type ERC721.

```
// TODO: Add way to instantiate contract.
// Maybe just the same as ethers.js?
const contract

const balance = await contract.balanceOf(owner)
const owner = await contract.ownerOf(tokenId)

// supportsInterface is a bool
// Checks whether the contract will let you look
// up other interfaces it implements using ERC165

const supportsInterface = await contract.supportsInterface(interfaceId)

// TODO: With the proper type conversion, etc.
const INTERFACE_ID_ERC721_METADATA = 0x5b5e139f;

//
// 0x5b5e139f ===
//   bytes4(keccak256('name()')) ^
//   bytes4(keccak256('symbol()')) ^
//   bytes4(keccak256('tokenURI(uint256)'))
//

// returns a bool
const supportsMetadata = await contract.supportsInterface(INTERFACE_ID_ERC721_METADATA)

// Let's say using ERC165 we found that this contract
// implements that interface.

if (supportsMetadata) {
  const tokenURI = await contract.tokenURI(tokenId)
}

```

Ideas for getting clever with ABIs at this level of abstraction:
Find all view (external or public) functions and assume they're the interesting ones for looking up state, and infer from param types what they might do.

// Optional function:
// Does all data-getting it can based on what we know about the ABI or from ERC165.
const data = await contract.getAllData()

##### contract from ethers.js

Let's read the `tasit-act` section above when we're done and see how much it differs from the ethers abstraction for connecting to contracts
[Ethers](https://docs.ethers.io/ethers.js/html/api-contract.html#connecting-to-existing-contracts)

### Setting data

Setting data could possibly be non-async if it's like publishing in pubsub.

##### tasit-act

Using the contract abstraction from ethers.js, setting data returns a transaction hash.

That's too blockchain-y for the target audience. This API should be indistinguishable from using pubsub on a non-blockchain architecture.

So the set should return something that lets the user subscribe for the 1st or or 7th or nth confirmation of the result, but it shouldn't be a tx hash. Still thinking about what it should be.

One option is:

```
const subscription = contract.transferFrom(from, to, tokenId)

function onMessage(message) {
  // message.data = Contents of the message.
  const { data } = message
  const { confirmations } = data
  if (confirmations === 7) {
    // do something
    subscription.removeAllListeners()
  }
}


subscription.on("confirmation", handlerFunction)

```

##### contract from ethers.js

Setting data on a contract returns a tx hash

### Listening for events

Listening for events has almost the exact same API as when you're subscribed for being notified of block confirmations for a given set operation.

But the subscription is initiated with a subscribe function as opposed to it being the result of a set operation.

```
const subscription = contract.subscribe([events])
subscription.on("exampleEvent", handlerFunction)
```

##### ERC 721

Note: The ERC721 level of abstraction for listening for events would already know what events to listen for and let you subscribe to them like so:

```
// Subscriptions is an object where the keys are the event names from ERC721
const subscriptions = contract.subscribeAll()
const { transfer } = subscriptions
```
