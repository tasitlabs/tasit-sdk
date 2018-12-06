This explains how one might interact with smart contracts at different levels of abstraction using `tasit-act`.

Why `tasit-act`? act: [akt], verb. "to do something". It's also nice that it's part of the word contract.

### Notes

Getting data is like an HTTP(S) request, so it should be async. Because doing the JSON-RPC request to Infura and getting data back has network lag.

Setting data could possibly be non-async if it's like publishing in pubsub. It could be sync too if we're picturing a pubsub approach where successful publication is instantly ACK'ed.

Then you subscribe for the data like it's pubsub as well. That would make subscribing to the "event" of 1 or 7 or 100 block confirmations for a set operation have a very similar API to the one for subscribing to events.

### Table of Contents

- [Getting data](#getting-data)

- [Setting data](#setting-data)

- [Listening for events](#listening-for-events)

### Getting data

##### Decentraland

Let's start at the highest level of abstraction possible, where we can construct our ideal API for the end user assuming we know the SDK is being used specifically for the Decentraland contracts.

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

const landIds = await decentraland.getAllLandIdsIncludingEstates(userId)
```

All of this could be done with a little more work using just the ERC721 abstraction, below, though. Under the hood it uses `tokenOfOwnerByIndex` from ERC721Enumerable, for instance.

Open questions:

- Whether the address should be configurable at this level of abstraction. For instance, the developer using this SDK might know sooner than the Tasit SDK project core devs do that a non-upgradeable contract project (that is, a standard smart contract project - not a delegatecall + proxy project) is deploying new contracts and will be using a new interface address from now on.
- Whether the ABI should be in version control in this package or whether we want to add functionality for getting it from the web, using Etherscan's API or hopefully a decentralized npm where teams publish generated files like ABIs down the road.

##### ERC 721

Let's now consider a slightly lower level of abstraction, where we can construct our ideal API for the end user assuming we know the SDK is being used specifically for an ERC721 (NFT) contract, but not which one until the user instantiates the contract using the SDK.

There's functionality for determining what ERC721 features it supports beyond the basic, required ones using ERC165 interface detection.

Or maybe there doesn't need to me if we decide the contract ABI will be present for sure. This is an _open question_ for now.

Moreso than for an unknown contract with the lower-level `tasit-act` API, using ERC165 here is justified because it's a first-class feature for extensions of ERC721 in [OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/5caecf548c04c97955b8f0487ceb804fab0e2ca1/contracts/token/ERC721/ERC721Metadata.sol#L5)

```
// TODO: Decide if this is all that is needed to instantiate it
const nft = new NFT(address, contractABI)
```

detectInterfaces returns an object of ERC721-related interfaces it supports.
Internally it calls the lower level `contract.supportsInterface()` first.

```
const { supportsMetadata } = await nft.detectInterfaces()
if (supportsMetadata) {
  const metadata = await nft.getMetadata()
  const { tokenURI } = metadata // metadata also contains name and symbol
}
```

Alternatively, because tokenURI is just an external or public view function you can get it directly using the underlying contract method approach you'll see used exclusively below

```

const tokenURI = await nft.tokenURI(tokenId)

```

Fetching additional metadata from the tokenURI is obviously something we need to support. It doesn't feel like it makes sense to have a function for doing this as a `nft.xyz(...)` method, though.

Fetching images from additional URIs linked to in the JSON blob available at the main tokenURI will also be a common use case in the app.

##### tasit-act

A low-level library for calling all of the functions on a given smart contract and listening to events from a smart contract.

To make this example comparable with the ERC721 example above, let's say the contract happens to be of the same type, ERC721.

```

// TODO: Add way to instantiate contract.
// Maybe just the same as ethers.js?
const contract

const balance = await contract.balanceOf(owner)
const owner = await contract.ownerOf(tokenId)

```

Checks whether the contract will let you look up other interfaces it implements using ERC165

```
// supportsInterface is a bool
const supportsInterface = await contract.usesSupportsInterface()
```

Let's use ERC165 to see if this contract uses the ERC721Metadata extension. Remember, this will be a longer shot because we're just using `tasit-act`, not the ERC721 abstraction that already "knows" ERC165 is popular for ERC721s. But if we decide the user of the SDK has to have the full ABI at this point, maybe this feature is less useful.

```
// TODO: Add the proper type conversion, etc.
// Note: This is straight from Solidity, the string as it is probably isn't right.
const INTERFACE_ID_ERC721_METADATA = "0x5b5e139f";

// 0x5b5e139f ===
// bytes4(keccak256('name()')) ^
// bytes4(keccak256('symbol()')) ^
// bytes4(keccak256('tokenURI(uint256)'))
//

// returns a bool
const supportsMetadata = await contract.supportsInterface(INTERFACE_ID_ERC721_METADATA)

if (supportsMetadata) {
  const tokenURI = await contract.tokenURI(tokenId)
}

```

Ideas for getting clever with ABIs at this level of abstraction:
Find all view (external or public) functions and assume they're the interesting ones for looking up state, and infer from param types what they might do.

Optional function to consider:

`const data = await contract.getAllData()`

`getAllData()` does all data-fetching it can in a single call based on what we know from the ABI or from ERC165.

##### contract from ethers.js

Let's re-read the `tasit-act` section above when it is finalized and see how much it differs from the [ethers.js abstraction for connecting to contracts](https://docs.ethers.io/ethers.js/html/api-contract.html#connecting-to-existing-contracts).

We'll want to do the same for setting data and listening for events too. As long as there's any abstraction we want on top of the ethers.js contract functions, `tasit-act` for contracts of unknown type seems justified.

### Setting data

Setting data could possibly be non-async if it's like publishing in pubsub. There's additional info on this in the [notes](#notes) section at the beginning.

##### tasit-act

When using the contract abstraction from ethers.js, the functions for setting data return a transaction hash.

That's too blockchain-y for the target audience. The API is being informed too much by the underlying implementation as opposed to the most understandable abstraction. The `tasit-act` API for setting data should be indistinguishable from using pubsub on a non-blockchain architecture.

So the "set" should return something that lets the user subscribe for the 1st or or 7th or nth confirmation of the result, but it shouldn't be a tx hash.

Here's one option for how it could work:

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

Since remembering to remove the listener is a little clunky, we could also include

`subscription.once("enough-confirmations", handlerFunction)`

Perhaps during or before sending the transaction the user of the SDK picks what type of events they want to be subscribed to.

##### contract from ethers.js

Setting data on a contract returns a tx hash. In the docs for ethers.js, next they `await` to see that the transaction has been confirmed. `tasit-act` has more of a "optimistic updates" but "be sure to handle error cases" philosophy.

### Listening for events

##### tasit-act

Listening for events has a similar API as when you're subscribed for being notified of block confirmations for a given "set" operation.

But unlike for "set" operations, the subscription isn't created implicitly.

Here, it is initiated explicitly with a subscribe function.

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

In this example there's an event `Transfer`, and `transfer` refers to that subscription. So you could do `transfer.removeAllListeners()` and still be subscribed to other events.

### Topics for the future

Is it worth considering having upgradeable smart contracts being a first-class feature of this package? That would mean not assuming the ABI you have right now will always work. But, it could still potentially assume there will be a backwards compatibility guarantee and the existing ABI functions would continue to be supported.
