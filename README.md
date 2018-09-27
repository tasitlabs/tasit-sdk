# TasitSDK

The Tasit SDK is a JavaScript SDK for making mobile apps for Ethereum dapps using React Native.

We encourage contributions by the community, so please reach out!

### Why?

Today, using a dapp from your phone is painful. Almost no dapps have standalone mobile apps, and I’m not easily able to use the dapp without ETH or with the ETH I have in another wallet. We lose mainstream people from the onboarding funnel because of this. Some dapps can be used inside a single app like Coinbase Wallet or Status that serves as a dapp browser, but this feels like a terribly broken UX for anyone who has been using a mobile phone for a while, and it also feels like broken UX for people who are used to using web-based dapps with MetaMask. The ideal UX would be installing each mobile dapp in a way that feels the same as installing any mobile app, and giving it permission to take actions with my ETH held in a separate wallet.

One major reason most dapps don’t have standalone mobile apps today is because it’s hard for developers to build mobile Ethereum dapps. There isn’t any good tooling for it. Most developers building interesting new mobile apps these days use React Native to automatically support both iOS and Android, but there is little-to-no tooling for Ethereum in the React Native ecosystem. The Tasit SDK provides that tooling.

The idea is that the Tasit SDK would be used by many different mobile apps on a user's device. Once the Tasit SDK is around, more dapps will have dedicated mobile apps. This will remove a key barrier to mainstream adoption of Ethereum dapps.

### Getting started

You can use the Tasit SDK to create user-friendly mobile iOS and Android apps for a dapp using React Native. Getting started is as simple as running

`npm install --save tasit-sdk`

Then just run

`tasit init`

to automatically generate the scaffolding for a mobile dapp project.

Alternatively, for popular ERC standards like ERC-721 for NFTs, you can even run

`tasit init --nft`

to instantly create a standalone mobile dapp for CryptoKitties, Decentraland, etc.

This app scaffold comes ready to submit for beta testing on iOS with Testflight and on Android with Google Play Beta track.

### More details on the features of the Tasit SDK

#### Account and private key generation

Using the Tasit SDK, you can generate a new Ethereum account and private key. The intended UX is that this account should NOT have ETH, ERC20, or ERC721 tokens sent to it. This app is NOT a wallet. Instead, this address should be authorized to perform actions on behalf of a smart-contract-based wallet a user already has with some ETH or tokens.

_This means fewer steps that need to be taken to onboard a new user._

#### Connects with your preferred wallet

Through compatibility with WalletConnect, any app can be authorized to take actions in a way that has only been possible in wallet apps to date. The wallet might be an [Aragon personal DAO](http://blog.aragon.one/enter-the-world-of-personal-daos), the [Gnosis Safe personal edition](https://blog.gnosis.pm/announcing-the-gnosis-safe-beta-personal-edition-19a69a4453e8), the [Balance wallet](https://twitter.com/ricburton/status/1038772498756714496), any wallet that may be built to be compatible with [Alex Van de Sande’s universal logins (ERC 1077 and 1078)](https://www.youtube.com/watch?v=WODqP3DR8rA), Status, etc.

_This means a flow that users will be used to which decreases the friction for onboarding people who have used other Ethereum dapps._

#### Injecting web3.js

The Tasit SDK provides tooling for web3 to be injected in each mobile app it is used in.
This is necessary to be able to initiate transactions on the Ethereum blockchain from within the app.
JavaScript middleware for reading from and writing to smart contracts
JavaScript middleware for reading from and writing to smart contracts through an expressive API.

_This makes the experience for new developers working on a mobile app with the Tasit SDK simpler, which means more mobile dapps for end users._

#### Apps generated with the Tasit SDK are customizable

The Decentraland and CryptoKitties apps generated using “tasit init --nft” ships with styled-but-customizable React Native components for using each feature of the dapp, leveraging the js middleware.

_This also makes the experience for new developers working on a mobile app with the Tasit SDK simpler, which also means more mobile dapps for end users._

#### Advanced support for popular ERC standards

Classes of smart contracts we support include [NFTs](http://erc721.org/), [TCRs](https://medium.com/@simondlr/city-walls-bo-taoshi-exploring-the-power-of-token-curated-registries-588f208c17d5), [DAOs](https://blog.aragon.org/bringing-daos-back-aragon-monthly-92756cb65639/), and two-sided marketplaces (like Gitcoin, CryptoCribs, Ethlance, etc.). There’s an ERC-standard-specific JavaScript API wrapping the core web3 API so that the function-names in the Tasit SDK are tailored to that type of dapp. As long as we’ve built the tooling to interact with that class of dapp at least once before, the Tasit SDK can “automagically” support any new dapp of that type.

_This means there’s a network effect for the Tasit SDK, so once we have a few apps using it, it will be much faster to make new apps with it._

#### Tool for finding address of a popular smart contract

The Tasit SDK also provides a standalone tool for discovering the current address of a high-profile dapp project’s primary smart contract interface. We detect the interface / ERC standard a smart contract implements using ERC-165 standard interface detection.

_This makes it simpler to customize the autogenerated app for a certain ERC standard and swap it to use with your own smart contracts or the already-on-chain smart contracts for a different dapp of that same ERC-type._

#### eWASM support

The Tasit SDK will work with Ethereum 2.0. We support Ethereum-based dapps to start, and in the long run the Tasit SDK will work with any blockchain that uses EVM and/or eWASM.

_In order for the Tasit SDK to make a difference for current and future users of Ethereum, it will need to support future versions of the EVM._

### Notes

We already said this, but it's worth repeating:

We encourage contributions by the community, so please reach out!

- [Telegram](https://t.me/tasitlabs)
- [Website](https://tasit.io/)
- [Email](mailto:founders@tasit.io)
- [GitHub issues](https://github.com/tasitlabs/tasitsdk/issues)
