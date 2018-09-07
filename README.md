# TasitSDK

The Tasit SDK is a standardized, open-source set of tools and components for interacting with major classes of already-on-chain dapp smart contracts. The Tasit SDK is intended to be used on mobile devices (iOS and Android) for app written in React Native.

### Tools for major classes of dapps

Early, popular classes of smart contracts we support include [NFTs](http://erc721.org/), [TCRs](https://medium.com/@simondlr/city-walls-bo-taoshi-exploring-the-power-of-token-curated-registries-588f208c17d5), [DAOs](https://blog.aragon.org/bringing-daos-back-aragon-monthly-92756cb65639/), and two-sided marketplaces (like Gitcoin, CryptoCribs, Ethlance, etc.).

The tools for each class of smart contract include:

- Middleware for reading from and writing to smart contracts via an expressive JavaScript library with function names tailored to that type of dapp
- Styled-but-customizable React Native components for using each feature of the dapp, leveraging the js middleware

The Tasit SDK also provides a standalone tool for discovering the current address of a high-profile dapp project’s primary smart contract interface.

### Tools for using Ethereum on a mobile device

#### Injecting web3

Unlike Coinbase Wallet, Status, Cipher, or Vault, the idea is that the Tasit SDK would be used by many different mobile apps on a user's device. That is, a user wouldn't use every dapp through a single-app browser with web3 injected there. Instead, the Tasit SDK provides tooling for web3 to be injected in each mobile app it is used, each time with a different Ethereum addres. There are more details in the section `Accounts and private keys` below.

#### Accounts and private keys

Using the Tasit SDK, you can generate a new Ethereum account and private key. The intended UX is that this account should NOT have ETH, ERC20, or ERC721 tokens sent to it. Instead, this address should be authorized to perform actions on behalf of a smart-contract-based wallet a user already has with some ETH or tokens.

More info on this approach here:

- http://blog.aragon.one/enter-the-world-of-personal-daos
- https://blog.gnosis.pm/announcing-the-gnosis-safe-beta-personal-edition-19a69a4453e8
- https://www.youtube.com/watch?v=WODqP3DR8rA

### Notes

We support Ethereum-based dapps to start, and in the long run the Tasit SDK will work with any blockchain that uses EVM and/or eWASM.

In the case of Ethereum, we detect the interface / ERC standard a smart contract implements using ERC-165 standard interface detection whenever possible.

As long as we’ve built the tooling to interact with that class of dapp at least once before, the Tasit SDK can “automagically” support any new dapp of that type.

We encourage contributions by the community, so please reach out!
