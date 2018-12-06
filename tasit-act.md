This explains how one might interact with smart contracts at different levels of abstraction using tasit-act

### Notes

Before sharing this, it could make sense to invert the order

### Getting data

##### Decentraland

I think at this level of abstraction, we stop ever using ERC165 interface detection.
We just know the ABI for the open source contracts and assume the presence of these
functions.

T.B.D. whether the address should be configurable at this level of abstraction.

```
import { Decentraland } from tasit-act
const decentraland = new Decentraland()

const balance = decentraland.balanceOf(address owner)
```

##### ERC 721

A higher-level API focused on ERC721. infering what it can with ERC165 interface detection.

```
const nft

// Returns an object of ERC721-related interfaces it supports
// Internally it calls the lower level
// contract.supportsInterface() first.

const { supportsMetadata } = nft.detectInterfaces()

if (supportsMetadata) {
  const metadata = nft.getMetadata()
  const { tokenURI } = metadata // metadata also contains name and symbol
}

// Alternatively, because tokenURI is just an external or public view function
// you can get it directly using the underlying contract method approach
// you'll see used exclusively below
const tokenURI = nft.tokenURI(tokenId)
```

##### tasit-act

A low-level way for calling all of the functions on a given smart contract

```
// get data
// supports whatever getters the contract implements
// To make it comparable with the ERC721 example
// above, let's say the contract happens to be
// of type ERC721.

// TODO: Add way to instantiate contract
const contract

const balance = contract.balanceOf(owner)
const owner = contract.ownerOf(tokenId)

// supportsInterface is a bool
// Checks whether the contract will let you look
// up other interfaces it implements using ERC165

const supportsInterface = contract.supportsInterface(interfaceId)

// TODO: With the proper type conversion, etc.
const INTERFACE_ID_ERC721_METADATA = 0x5b5e139f;

//
// 0x5b5e139f ===
//   bytes4(keccak256('name()')) ^
//   bytes4(keccak256('symbol()')) ^
//   bytes4(keccak256('tokenURI(uint256)'))
//

// returns a bool
const supportsMetadata = contract.supportsInterface(INTERFACE_ID_ERC721_METADATA)

// Let's say using ERC165 we found that this contract
// implements that interface.

if (supportsMetadata) {
  const tokenURI = contract.tokenURI(tokenId)
}

```

Ideas for getting clever with ABIs at this level of abstraction:
Find all view (external or public) functions and assume they're the interesting ones for looking up state, and infer from param types what they might do.

##### contract from ethers.js

Let's read the `tasit-act` section above when we're done and see how much it differs from the ethers abstraction
[Ethers](https://docs.ethers.io/ethers.js/html/api-contract.html#connecting-to-existing-contracts)

### Setting data

### Listening for events
