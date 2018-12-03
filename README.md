# Tasit SDK

<div align="left">
  <img src="/images/TasitLogoGrayscale.png" width="200" />
</div>

### Introduction

The Tasit SDK is a JavaScript SDK for making mobile Ethereum dapps using React Native.

##### Already convinced you've been looking for something like this?

You can continue right on to the [Getting started](#getting-started) section below.

##### A bit skeptical about the need for mobile dapps?

You might want to jump ahead to the "why" sections to start:

- [Why (from the user's perspective)?](#why-from-the-users-perspective)

- [Why (from a developer / Ethereum enthusiast’s perspective)?](#why-from-a-developer--ethereum-enthusiasts-perspective)

### Getting started

You can use the Tasit SDK to create user-friendly mobile iOS and Android apps for a dapp using React Native.

#### Installation

Getting started is as simple as running

`npm install --save tasit-sdk`

#### Usage

Are you looking to add functionality to a pre-existing app using the Tasit SDK?

Using the Tasit SDK from within your app is simple.
In `App.js` or the appropriate React Native component, import whichever APIs you need from the Tasit SDK.

```
import { Account } from 'tasit-sdk'
const wallet = await Account.create();
console.log(wallet); // { address: '...', privateKey: '...', publicKey: '...' }
...
```

#### Automatic scaffolding using the Tasit CLI

Are you starting a project from scratch? Let the Tasit CLI (installed automatically with the Tasit SDK) scaffold out your project for you.

Just run `npx tasit init` to automatically generate the scaffolding for a mobile dapp project.

Alternatively, for popular ERC standards like ERC-721 for NFTs, you can even run `npx tasit init --nft` to instantly create a standalone mobile dapp for CryptoKitties, Decentraland, etc.

This app scaffold comes ready to submit for beta testing on iOS with Testflight and on Android with Google Play Beta track, so you can focus on the core features of your dapp like you would do on the web.

#### Modular

The Tasit SDK is designed with modularity in mind. Are you only planning on using the Tasit SDK for generating an Ethereum acccount in your app? That works too!

You can install `tasit-account` directly and keep your app's dependencies leaner.

```
npm install --save tasit-account
```

Then the usage example from before becomes:

```
import Account from 'tasit-account'
...
```

...with the rest of the code remaining the same.

### Features

#### Account and private key generation

Using the Tasit SDK, you can generate a new Ethereum account and private key. The intended UX is that this account should NOT have ETH, ERC20, or ERC721 tokens sent to it. This app is NOT a wallet. Instead, this address should be authorized to perform actions on behalf of a smart-contract-based wallet a user already has with some ETH or tokens. This is an ephemeral account for that app on the device, and as the user gets more familiar with it their account can be progressively upgraded to a personal DAO later.

_This means fewer steps that need to be taken to onboard a new user._

#### Supports both Infura and geth light nodes

We realized that different developers have different takes on whether it's acceptable to use Infura like MetaMask does in the browser, or whether a node more like Status or Augur is warranted. As such, this SDK supports both. The approach with the light node is much like Status' current approach, except in each individual app instead of one main wallet/messaging app. If [Nimbus](https://blog.status.im/introducing-nimbus-3360367bb311) gets a lot of traction down the road, we'll happily support that as well.

Have a strong opinion on whether we should prioritize Infura-style or light-node-style first? Please [reach out](#contact-us)!

#### Onboarding

Supports both universal logins and connecting with your mobile Ethereum wallet

##### Universal logins (and therefore meta-transactions)

The approach with [Alex Van de Sande’s universal logins (ERC 1077 and 1078)](https://www.youtube.com/watch?v=WODqP3DR8rA) and [meta-transactions](https://medium.com/@austin_48503/ethereum-meta-transactions-90ccf0859e84) is that the user's account is only used to sign messages, and then as a developer you can use your preferred centralized or decentralized solution to relay that as an Ethereum tx and pay and/or be rewarded as each solution sees fit.

##### Connects with your preferred mobile Ethereum wallet

Through compatibility with WalletConnect, any app can be authorized to take actions in a way that has only been possible in wallet apps to date. The wallet might be an [Aragon personal DAO](http://blog.aragon.one/enter-the-world-of-personal-daos), the [Gnosis Safe personal edition](https://blog.gnosis.pm/announcing-the-gnosis-safe-beta-personal-edition-19a69a4453e8), the [Balance wallet](https://twitter.com/ricburton/status/1038772498756714496), Status, etc.

##### Wrapping up onboarding

_This means a flow that users will be used to which decreases the friction for onboarding people who have used other Ethereum dapps._

Have a strong opinion on whether we should prioritize meta-transactions-style or personal-DAO-style first? Please [reach out](#contact-us)!

#### Using ethers.js for JSON-RPC requests

The Tasit SDK provides tooling for ethers.js to be instantiated in each mobile app it is used in.

This is necessary to be able to initiate transactions on the Ethereum blockchain from within the app.

JavaScript middleware for reading from and writing to smart contracts through an expressive API.

_This makes the experience for new developers working on a mobile app with the Tasit SDK simpler, which means more mobile dapps for end users._

#### Apps generated with the Tasit SDK are customizable

The Decentraland and CryptoKitties apps generated using `tasit init --nft` ship with styled-but-customizable React Native components for using each feature of the dapp, leveraging the js middleware.

_This also makes the experience for new developers working on a mobile app with the Tasit SDK simpler, which also means more mobile dapps for end users._

#### Advanced support for popular ERC standards

Classes of smart contracts we support include [NFTs](http://erc721.org/), [TCRs](https://medium.com/@simondlr/city-walls-bo-taoshi-exploring-the-power-of-token-curated-registries-588f208c17d5), [DAOs](https://blog.aragon.org/bringing-daos-back-aragon-monthly-92756cb65639/), and two-sided marketplaces (like Gitcoin, CryptoCribs, Ethlance, etc.). There’s an ERC-standard-specific JavaScript API wrapping the core ether.js API so that the function-names in the Tasit SDK are tailored to that type of dapp. As long as we’ve built the tooling to interact with that class of dapp at least once before, the Tasit SDK can “automagically” support any new dapp of that type.

_This means there’s a network effect for the Tasit SDK, so once we have a few apps using it, it will be much faster to make new apps with it._

#### Tool for finding address of a popular smart contract

The Tasit SDK also provides a standalone tool for discovering the current address of a high-profile dapp project’s primary smart contract interface. We detect the interface / ERC standard a smart contract implements using ERC-165 standard interface detection.

_This makes it simpler to customize the autogenerated app for a certain ERC standard and swap it to use with your own smart contracts or the already-on-chain smart contracts for a different dapp of that same ERC-type._

#### eWASM support

The Tasit SDK will work with Ethereum 2.0. We support Ethereum-based dapps to start, and in the long run the Tasit SDK will work with any blockchain that uses EVM and/or eWASM.

_In order for the Tasit SDK to make a difference for current and future users of Ethereum, it will need to support future versions of the EVM._

### Why?

#### Why (from the user's perspective)?

Today, using a dapp from your phone is painful. Almost no dapps have standalone mobile apps, and I’m not easily able to use the dapp without ETH or with the ETH I have in another wallet. We lose mainstream people from the onboarding funnel because of this. Some dapps can be used inside a single app like Coinbase Wallet or Status that serves as a dapp browser, but this feels like a terribly broken UX for anyone who has been using a mobile phone for a while, and it also feels like broken UX for people who are used to using web-based dapps with MetaMask. The ideal UX would be installing each mobile dapp in a way that feels the same as installing any mobile app, and giving it permission to take actions during onboarding with the costs subsidized by others or with my ETH held in a separate wallet.

The idea is that the Tasit SDK would be used by many different mobile apps on a user's device. Once the Tasit SDK is around, more dapps will have dedicated mobile apps. This will remove a key barrier to mainstream adoption of Ethereum dapps.

#### Why (from a developer / Ethereum enthusiast's perspective)?

The user-facing answer for "Why?" focused on the UX/product, since that's the main thing that mainstream users care about. Here we'll touch on more technical/ideological arguments for why it's important that the Ethereum community creates more mobile dapps.

One major reason most dapps don’t have standalone mobile apps today is because it’s hard for developers to build mobile Ethereum dapps. There isn’t much good tooling for it. Most developers building interesting new mobile apps these days use React Native to automatically support both iOS and Android, but there is little-to-no tooling for Ethereum in the React Native ecosystem. The Tasit SDK provides that tooling.

The web-based front end for most dapps these days are written with React, so using React Native for the native mobile version is a natural fit.

Developers shouldn't need to reinvent the wheel for each new dapp: account and private key generation, linking to another wallet or adding meta-transaction support, etc. Let the Tasit SDK handle that bit and focus on the business logic for your dapp.

##### Proof of decentralization

Tasit will serve as "proof of decentralization" for the dapps we support. Vitalik tweeted 'One simple litmus test for whether or not a blockchain project is truly decentralized: can a third party independently make a client for it, and do everything that the "official" client can?'. It's time for major decoupling of "back end" and front end.

##### Right to exit for users

A single company's financial incentives determining how a software product works is a bummer for users. See Facebook's newsfeed changing to clickbait, or see Twitter users clamoring for simple changes to the product like spambot or harassment detection to no avail.

### Contact us

We love getting feedback from the community, so please feel free to reach out.

- [Website](https://tasit.io/)

- [Twitter](https://twitter.com/tasitlabs)

- [Telegram](https://t.me/tasitlabs)

- [Email](mailto:founders@tasit.io)

- [Feature requests](https://tasit.canny.io/feature-requests)

- [Project Kanban board](https://github.com/orgs/tasitlabs/projects/1)
