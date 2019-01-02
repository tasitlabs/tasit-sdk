# `tasit-act`

This package helps with reading data from smart contracts, writing data to smart contracts, and listening for events.

Most of the details are in the main README for the monorepo [here](https://github.com/tasitlabs/TasitSDK/blob/develop/README.md)

# Reading and writing data and reacting to events

This explains how one can use the Tasit SDK to interact with smart contracts at different levels of abstraction.

[For context, here is an overview](https://github.com/tasitlabs/TasitSDK#reading-and-writing-data-and-reacting-to-events) of how this fits in with the rest of the Tasit SDK.

_Note:_ This functionality all "lives" in `tasit-act`, a subpackage of the [`tasit-sdk`](https://github.com/tasitlabs/TasitSDK) that is also published to npm as a standalone module using [lerna](https://lernajs.io/). Why `tasit-act`? **act:** [akt], verb. "to do something". It's also nice that it's part of the words _contract_ and _abstraction_.

### Notes

Getting data is like an HTTP(S) request, so it should be async. Because doing the JSON-RPC request to Infura and getting data back has network lag.

Setting data could possibly be sync (non-async) if it's like publishing in pubsub with no ACK and it's instant. It could be async too if we're picturing a pubsub approach where successful publication is ACK'ed, but not instantly. Or if the ACK is instant, then we're back to sync.

Then you subscribe for the data like it's pubsub as well. That would make subscribing to the "event" of 1 or 7 or 100 block confirmations for a set operation have a very similar API to the one for subscribing to events.

### Table of Contents

- [Getting data](#getting-data)

- [Setting data](#setting-data)

- [Listening for events](#listening-for-events)

# Docs

### Getting data

- [Decentraland](#getting-data---decentraland)

- [ERC721](#getting-data---erc721)

- [Low-level Tasit SDK middleware](#getting-data---low-level-tasit-sdk-middleware)

- [Contract API from ethers.js](#getting-data---contract-api-from-ethersjs)

##### Getting data - Decentraland

Let's start at the highest level of abstraction possible, where we can construct our ideal API for the end user assuming we know the SDK is being used specifically for the Decentraland contracts.

I think at this level of abstraction, we don't use ERC165 interface detection like we do at lower levels (see below). But actually, using it at all warrants more thought, depending on whether we're assuming the user knows the full contract ABI or not (and depending on whether ethers.js assumes that.)

We just know the ABI for the open source contracts for that exact project and assume the presence of these functions. The developer can still use the lower-level APIs to confirm, though.

````javascript
import { Decentraland } from tasit-act

// We already know what would have normally been the params here
// (contractABI, address, etc.)
const decentraland = new Decentraland()
```javascript

Low-level functions still work

```javascript
const balance = await decentraland.balanceOf(owner)
```javascript

Optional: Expose higher-level functions that are specific to this dapp

```javascript
// This is not necessarily the name of the function in the contracts
// but whatever we think would be simplest for the developer using this
const [x, y] = await decentraland.getLandCoordinates(landId)
```javascript

```javascript
// Decentraland has some land owned by estates which are owned by users
// and some land owned directly by users
// You might want to get all the land a user owns even if they have it
// inside an estate. Now we're getting past the standard ERC721 functionality
// and supporting features specific to Decentraland

const landIds = await decentraland.getAllLandIdsIncludingEstates(userId)
```javascript

All of this could be done with a little more work using just the ERC721 abstraction below, though. Under the hood it uses `tokenOfOwnerByIndex` from ERC721Enumerable, for instance.

Open questions:

- Whether the address should be configurable at this level of abstraction. For instance, the developer using this SDK might know sooner than the Tasit SDK project core devs do that a non-upgradeable contract project (that is, a standard smart contract project - not a delegatecall + proxy project) is deploying new contracts and will be using a new interface address from now on.
- Whether the ABI should be in version control in this package or whether we want to add functionality for getting it from the web, using Etherscan's API or hopefully a decentralized npm where teams publish generated files like ABIs down the road.

##### Getting data - ERC721

Let's now consider a slightly lower level of abstraction, where we can construct our ideal API for the end user assuming we know the SDK is being used specifically for an ERC721 (NFT) contract, but not which one until the user instantiates the contract using the SDK.

There's functionality for determining what ERC721 features it supports beyond the basic, required ones using ERC165 interface detection.

Moreso than for an unknown contract with the lower-level `tasit-act` API, using ERC165 here is justified because it's a first-class feature for extensions of ERC721 in [OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/5caecf548c04c97955b8f0487ceb804fab0e2ca1/contracts/token/ERC721/ERC721Metadata.sol#L5).

But maybe there doesn't need to be if we decide the contract ABI will be present for sure. This is an _open question_ for now.

Anyway, here's how to instantiate the contract:

```javascript
// TODO: Decide if we can instantiate this with more or less params
const nft = new NFT(address, contractABI)
// or
const nft = new NFT(address) // with an assumed ABI
```javascript

`detectInterfaces()` returns an object of ERC721-related interfaces this ERC721 contract supports (since there is a basic ERC721 interface but also some more fully-featured extensions).

Internally it calls the lower level `contract.usesSupportsInterface()` first to see if checking for specific interfaces is even worthwhile.

```javascript
const { supportsMetadata } = await nft.detectInterfaces()
if (supportsMetadata) {
  const metadata = await nft.getMetadata()
  const { tokenURI } = metadata // metadata also contains name and symbol
}
```javascript

Alternatively, because tokenURI is just an `external` or `public` `view` function you can get it directly using the underlying "call a contract method" approach you'll see used exclusively below in the lower-level `tasit-act` library with no prior knowledge about contract type.

```javascript
const tokenURI = await nft.tokenURI(tokenId)
```javascript

Fetching additional metadata from the tokenURI is obviously something we need to support. It doesn't feel like it makes sense to have a function for doing this as a `nft.xyz(...)` method, though.

Fetching images from additional URIs linked to in the JSON blob available at the main tokenURI will also be a common use case in the app.

##### Getting data - Low-level Tasit SDK middleware

A low-level library for calling all of the functions on a given smart contract and listening to events from the smart contract.

To make this example comparable with the ERC721 example above, let's say the contract happens to be of the same type, ERC721.

```javascript
// TODO: Finalize way to instantiate contract.
// Maybe just the same as ethers.js?
const contract = new contract(address, contractABI)

const balance = await contract.balanceOf(owner)
const owner = await contract.ownerOf(tokenId)
```javascript

Checks whether the contract will let you look up other interfaces it implements using ERC165

```javascript
// supportsInterface is a bool
const supportsInterface = await contract.usesSupportsInterface()
```javascript

Let's use ERC165 to see if this contract uses the ERC721Metadata extension. Remember, this will be a longer shot because we're just using `tasit-act`, not the ERC721 abstraction that already "knows" ERC165 is popular for ERC721s. Unlike above where we did `nft.detectInterfaces()`, we don't know the hashes of the interfaces to check for without the prior knowledge of what type of contract this is. So we'll need to check for ERC721Metadata using its hash as an argument.

If we decide the user of the SDK has to have the full ABI at this point, maybe this feature is less useful.

```javascript
// TODO: Add the proper type conversion, etc.
// Note: This is straight from Solidity - the string as it is probably isn't right.
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

```javascript

_Ideas for getting clever with ABIs at this level of abstraction:_

Find all `view` (`external` or `public`) functions. Assume they're the interesting ones for looking up state.

`const data = await contract.getAllData()`

`getAllData()` does all data-fetching it can in a single call based on what we know from the ABI or from ERC165.

Possibly even infer from param types what they might do, but that's a lot harder.

##### Getting data - Contract API from ethers.js

Let's re-read the `tasit-act` section above when it is finalized and see how much it differs from the [ethers.js abstraction for connecting to contracts](https://docs.ethers.io/ethers.js/html/api-contract.html#connecting-to-existing-contracts).

We'll want to do the same for setting data and listening for events too. As long as there's any abstraction we want on top of the ethers.js contract functions, `tasit-act` support for contracts of unknown type seems justified. Setting data / creating transactions is very likely to diverge from the ethers.js library.

### Setting data

Setting data could possibly be non-async if it's like publishing in pubsub. There's additional info on this in the [notes](#notes) section at the beginning.

- [Low-level Tasit SDK middleware](#setting-data---low-level-tasit-sdk-middleware)

- [Contract API from ethers.js](#setting-data---contract-api-from-ethersjs)

- [Decentraland](#setting-data---decentraland)

- [ERC721](#setting-data---erc721)

##### Setting data - Low-level Tasit SDK middleware

When using the contract abstraction from ethers.js, the functions for setting data return a transaction hash.

That's too blockchain-y for the target audience. The API is being informed too much by the underlying implementation as opposed to the most understandable abstraction. The `tasit-act` API for setting data should be indistinguishable from using pubsub on a non-blockchain architecture.

So the "set" should return something that lets the user subscribe for the 1st or 7th or nth confirmation of the result, but it shouldn't be a tx hash.

Here's one option for how it could work:

```javascript
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
```javascript

You could even imagine pre-attaching a listener with a handlerFunction by default for a few pubsub topics that the user of the SDK is likely to want.

Since remembering to remove the listener is a little clunky, we could also include a variant that unsubscribes after the first message for that topic. This is a pretty common pattern.

`subscription.once("enough-confirmations", handlerFunction)`

For more customization of how this works, during or before sending the transaction the user of the SDK could pick which types of events they want to be subscribed to.

##### Setting data - Contract API from ethers.js

Setting data on a contract returns a tx hash. In the example in the ethers.js docs, the next step is to `await` to see that the transaction has been confirmed.

`tasit-act` has more of a "optimistic updates" but "be sure to handle error cases" philosophy. Of course that could be achieved with the lower-level ethers.js API too, but the `tasit-act` abstraction gently guides the user towards that approach in a more opinionated fashion.

##### Setting data - Decentraland

```javascript
// TODO: Add me
// But this far down in in the docs, you can probably
// extrapolate how this would work from the rest
```javascript

##### Setting data - ERC721

```javascript
// TODO: Add me
// But this far down in in the docs, you can probably
// extrapolate how this would work from the rest
```javascript

### Listening for events

- [Low-level Tasit SDK middleware](#listening-for-events---low-level-tasit-sdk-middleware)

- [ERC721](#listening-for-events---erc721)

- [Decentraland](#listening-for-events---decentraland)

- [Contract API from ethers.js](#listening-for-events---contract-api-from-ethersjs)

##### Listening for events - Low-level Tasit SDK middleware

Listening for events has a similar subcriptions API to the one you use after creating a transaction (see above).

But unlike for "set" operations, the subscription isn't created implicitly.

Here, it is initiated explicitly with a subscribe function.

```javascript
const events = ["ExampleEvent", "AnotherExampleEvent"]
const subscription = contract.subscribe(events)
subscription.on("ExampleEvent", handlerFunction)
```javascript

##### Listening for events - ERC721

Note: The ERC721 level of abstraction for listening for events would already know what events to listen for and let you subscribe to them like so:

```javascript
// Subscriptions is an object where the keys are the event names from ERC721
const subscriptions = contract.subscribeAll()
subscriptions.remove("Transfer")
```javascript

In this example there's an event `Transfer` as one of the events supported by ERC721. After unsubscribing from transfer events, you're still be subscribed to other events emitted by the contract.

##### Listening for events - Decentraland

```javascript
// TODO: Add me
// But this far down in in the docs, you can probably
// extrapolate how this would work from the rest
```javascript

##### Listening for events - Contract API from ethers.js

```javascript
// TODO: Add me
// But this far down in in the docs, you can probably
// extrapolate how this would work from the rest
```javascript

### Topics for the future

Is it worth considering having upgradeable smart contracts being a first-class feature of this package? That would mean not assuming the ABI you have right now will always work. But, it could still assume that there will be a backwards compatibility guarantee and that the existing ABI functions would continue to be supported.
````
