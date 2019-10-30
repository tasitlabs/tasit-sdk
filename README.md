# Tasit SDK

[![CircleCI](https://circleci.com/gh/tasitlabs/TasitSDK.svg?style=svg)](https://circleci.com/gh/tasitlabs/TasitSDK)
[![Greenkeeper badge](https://badges.greenkeeper.io/tasitlabs/TasitSDK.svg)](https://greenkeeper.io/)

<div align="left">
  <img src="/docs/images/TasitLogoBlack.png" width="200" />
</div>

### Introduction

The Tasit SDK is a JavaScript/TypeScript SDK for making mobile Ethereum dapps using React Native.

Development of the Tasit SDK is supported in part by [Gnosis](https://github.com/gnosis/) through their [GECO](https://github.com/gnosis/GECO) grant initiative.

This project is open-source and in need of additional funding to sustain work on it. If you're able to contribute, please consider [supporting the project on Gitcoin Grants](https://gitcoin.co/grants/105/tasit-mobile-ethereum-dapps) or sending ETH or DAI to the Tasit project's vault address:

`0xd25def1db4f994e2800e438ebb29eae300d56151` ([Etherscan](https://etherscan.io/address/0xd25def1db4f994e2800e438ebb29eae300d56151))

_Disclaimer:_ The alpha version of this SDK is under active development. We encourage you to try it out today for hackathons, etc., but it's not ready for anything involving real funds on mainnet. If you'd prefer to wait for a more battle-tested release, please watch this repo with the `Releases only` setting and/or sign up to be notified about our releases on the [tasit.io](https://tasit.io) website.

---

### Table of contents

[Getting started](#getting-started)

- [Installation](#installation)
- [Usage](#usage)
- [Automatic scaffolding using the Tasit CLI](#automatic-scaffolding-using-the-tasit-cli)
- [Modular](#modular)

[Motivation](#motivation)

- [A bit skeptical about the need for mobile dapps?](#a-bit-skeptical-about-the-need-for-mobile-dapps)

[Main features](#main-features)

- [A pub/sub API for Ethereum contracts perfect for optimistic updates](#a-pubsub-api-for-ethereum-contracts-perfect-for-optimistic-updates)
- [Onboarding with ephemeral accounts, contract-based accounts, and deep-linking to and from mobile wallets](#onboarding-with-ephemeral-accounts-contract-based-accounts-and-deep-linking-to-and-from-mobile-wallets)
- [Advanced support for popular ERC standards and heavily used contracts](#advanced-support-for-popular-erc-standards-and-heavily-used-contracts)
- [A CLI for scaffolding a mobile dapp](#a-cli-for-scaffolding-a-mobile-dapp)
- [A library of native mobile dapp components](#a-library-of-native-mobile-dapp-components)

[Other features](#other-features)

- [Configurable JSON-RPC client](#configurable-json-rpc-client)
- [Tool for finding the address of a popular smart contract](#tool-for-finding-the-address-of-a-popular-smart-contract)
- [Serenity support](#serenity-support)

[Why](#why)

[Contact us](#contact-us)

---

### Getting started

You can use the Tasit SDK to create user-friendly mobile iOS and Android apps for a dapp using React Native.

Looking for the entry point for the `tasit-sdk` package? [That's here](/packages/tasit-sdk/). The Tasit SDK is a collection of smaller packages exported as one using [lerna](https://lernajs.io/).

#### Installation

Getting started is as simple as running

`npm install --save tasit-sdk`

#### Usage

Are you looking to add functionality to a pre-existing app using the Tasit SDK?

Using the Tasit SDK from within your app is simple.
In `App.js` or the appropriate React Native component, import whichever APIs you need from the Tasit SDK.

```javascript
import { Account } from "tasit-sdk";
const ephemeralWallet = Account.create();
console.log(ephemeralWallet.address); // '0x...'
// ...
```

Or maybe you want to interact with a contract:

```javascript
import { Contract } from "tasit-sdk";

const { NFT } = Contract;

// const contractAddress = '0x0E86...333'

const contract = new NFT(contractAddress);

const action = contract.safeTransferfrom(/*...*/);
action.on("error", errorListener);
action.on("enoughConfirmations", successListener);
action.sendForFree(); // meta-tx broadcast

// Do optimistic UI updates immediately, while making sure
// to update the UI again when there are enough
// confirmations for your use case
// ...
```

#### Automatic scaffolding using the Tasit CLI

Are you starting a project from scratch? Let the Tasit CLI scaffold out your project for you. More details on this [here](https://github.com/tasitlabs/tasit#automatic-scaffolding-using-the-tasit-cli).

The code for the CLI lives over in the [`tasit` repo](https://github.com/tasitlabs/tasit) with the code for the mobile apps, because it heavily uses the React Native components there when generating the scaffolding.

#### Modular

The Tasit SDK is designed with modularity in mind. Are you only planning on using the Tasit SDK for generating an ephemeral Ethereum acccount in your app? That works too!

You can install `tasit-account` directly and keep your app's dependencies leaner.

```
npm install --save tasit-account
```

Then the usage example from before becomes:

```javascript
import Account from "tasit-account";
// ...
```

...with the rest of the code remaining the same.

Or maybe you just want to use the simple abstraction for interacting with smart contracts. Then just install `tasit-action` directly instead.

```
npm install --save tasit-action
```

```javascript
import { Contract } from "tasit-action";
// ...
```

---

### Motivation

##### A bit skeptical about the need for mobile dapps?

You might want to jump ahead to the "why" sections to start:

- [Why (from the user's perspective)?](#why-from-the-users-perspective)

- [Why (from a developer's / Ethereum enthusiast’s perspective)?](#why-from-a-developers--ethereum-enthusiasts-perspective)

- [Why React Native?](#why-react-native)

---

### Main features

#### A pub/sub API for Ethereum contracts perfect for optimistic updates

The Tasit SDK provides JavaScript/TypeScript middleware for reading from and writing to smart contracts (and listening to events) through an expressive pub/sub API. Meta-transactions are a first-class feature of the API for interacting with contracts.

As a mobile developer, using the Tasit SDK to interact with the backend should be as simple as using Firebase as a backend-as-a-service. This library is written in such a way that the developer using the SDK can just think about writing data and listening for more data. The fact that there's a blockchain powering this is an implementation detail that is abstracted away.

This middleware wraps the core ethers.js contract API for making JSON-RPC requests.

[Here is a lot more info](/packages/tasit-action/README.md) about how this can be used.

[`tasit-action` is the child package](/packages/tasit-action/) that implements these features for the Tasit SDK.

_This makes the experience for new developers working on a mobile app with the Tasit SDK simpler, which means more mobile dapps for end users._

#### Onboarding with ephemeral accounts, contract-based accounts, and deep-linking to and from mobile wallets

Apps built with the Tasit SDK use an autogenerated in-app ephemeral account for the user to start with. We call it ephemeral (or burner or whatever you like) because it should never be the main place you hold your funds, and we don't ask you to back up the seed phrase for it. This brings the benefits of contract-based wallets like Gnosis Safe and Argent to dapps.

Once you have enough value that you shouldn't hold it with that account, it can either be added as a signer to a contract-based account or move funds back and forth to a mobile wallet through deep-linking.

This SDK takes an opinionated approach to onboarding (although since it's a modular repo, you still retain the ability to use other child packages and not the onboarding-related ones if you prefer). The SDK supports read-only mode, meta-transactions, smart-contract-based accounts, and connecting with your mobile Ethereum wallet.

##### Read-only for as long as possible

A native mobile dapp should be read-only for as long as possible. The user shouldn't know there's a blockchain involved or see anything about an account, and an Ethereum account shouldn't even be created until it becomes necessary. Why go through an onboarding flow at all right away?

This flow for reading data from contracts without onboarding first just works with no special configuration. So in a sense [`tasit-action` is the child package](/packages/tasit-action/) that implements these features, but really these are just the basic features of that child package we've already discussed.

##### Ephemeral account and private key generation

Using the Tasit SDK, you can generate a new Ethereum account and private key.

The Tasit SDK makes it simple for a new account to be instantiated in each mobile app it is used in.

The intended UX is that this account should NOT have any significant amount of ETH, ERC20, or ERC721 tokens sent to it. This app is NOT a wallet. Instead, this address should be authorized to perform actions on behalf of a smart-contract-based account or software wallet a user already has with some ETH or tokens. This is an ephemeral account for that app on the device, and as the user gets more familiar with it their account can be progressively upgraded to a personal DAO later or their funds can be stored in their preferred primary software wallet.

[`tasit-account` is the child package](/packages/tasit-account/) that implements these features for the Tasit SDK.

_This means fewer steps that need to be taken to onboard a new user._

##### For users new to Ethereum with no funds

For users without any ETH or tokens, any costs the user incurs at first should be subsidized. Give them a smart-contract-based account so that the UX around securing keys and recovering funds is simpler.

This can be done using [meta-transactions](https://medium.com/@austin_48503/ethereum-meta-transactions-90ccf0859e84) or [UniversalLoginSDK (ERC 1077 and 1078)](https://universallogin.io/) or [GnosisSafe](https://safe.gnosis.io/) or an [Aragon personal DAO](http://blog.aragon.one/enter-the-world-of-personal-daos).

The approach with meta-transactions (and universal login) is that the user's account is only used to sign messages, and then as a developer you can use your preferred centralized or decentralized solution to relay that as an Ethereum tx and pay and/or be rewarded as each solution sees fit.

[`tasit-contract-based-account` is the child package](/packages/tasit-contract-based-account/) that implements these features for the Tasit SDK.

##### For users that do have funds

Connects with your preferred mobile Ethereum wallet. Using ERC20+721 approvals or [WalletConnect](https://walletconnect.org/).

Users can continue to keep their funds in a proper wallet with better security guarantees if they do already have ETH, tokens, etc. and use them with this dapp.

A user flow where a dapp's ephemeral account requests an approval for X ERC20 tokens of type A or one ERC721 token of type B is supported in the SDK.

Through compatibility with WalletConnect, any standalone dapp can be authorized to take actions in a way that has only been possible in wallet apps to date. The wallet might be the [Gnosis Safe personal edition](https://blog.gnosis.pm/announcing-the-gnosis-safe-beta-personal-edition-19a69a4453e8), the [Balance wallet](https://twitter.com/ricburton/status/1038772498756714496), Status, Coinbase Wallet, Argent, BRD, etc.

[`tasit-link-wallet` is the child package](/packages/tasit-link-wallet/) that implements these features for the Tasit SDK.

##### Wrapping up onboarding

_This means a flow that users will be used to which decreases the friction for onboarding people who have used other Ethereum dapps._

Have a strong opinion on which onboarding flow we should prioritize the most? Please [reach out](#contact-us)!

#### Advanced support for popular ERC standards and heavily used contracts

Classes of smart contracts we support include [NFTs](http://erc721.org/), [TCRs](https://medium.com/@simondlr/city-walls-bo-taoshi-exploring-the-power-of-token-curated-registries-588f208c17d5), [DAOs](https://blog.aragon.org/bringing-daos-back-aragon-monthly-92756cb65639/), and two-sided marketplaces (like Gitcoin, CryptoCribs, Ethlance, etc.). There’s an ERC-standard-specific JavaScript/TypeScript API wrapping the lower-level Tasit SDK API for reading and writing and listening for data so that the function-names in the Tasit SDK are tailored to that type of dapp. As long as we’ve built the tooling to interact with that class of dapp at least once before, the Tasit SDK can “automagically” support any new dapp of that type.

[`tasit-action` is the child package](/packages/tasit-action/) that implements these features for the Tasit SDK.

_This means there’s a network effect for the Tasit SDK, so once we have a few apps using it, it will be much faster to make new apps with it._

#### A CLI for scaffolding a mobile dapp

The Decentraland and CryptoKitties apps generated using `tasit init --nft` ship with styled-but-customizable React Native components for using each feature of the dapp, leveraging the js middleware.

This feature lives over in our `tasit` repo - [details here](https://github.com/tasitlabs/tasit#automatic-scaffolding-using-the-tasit-cli) - since it's tightly integrated with the React Native mobile dapp codebase.

_This also makes the experience for new developers working on a mobile app with the Tasit SDK simpler, which also means more mobile dapps for end users._

#### A library of native mobile dapp components

This feature lives over in our `tasit` repo - [here](https://github.com/tasitlabs/tasit/tree/develop/shared) - since it's tightly integrated with the React Native mobile dapp codebase.

---

### Other features

#### Configurable JSON-RPC client

We realize that different developers have different takes on whether it's an acceptable compromise to use Infura in the way that MetaMask does in the browser or whether a local Ethereum light client is warranted more like in the original version of Status or Augur. We anticipate that in the short term, almost all developers using this SDK will use Infura. It's a good stopgap solution for now.

We leave the JSON-RPC provider configurable so that the SDK doesn't take an opinionated stance on this.

There are a couple projects working to make it simple to spin up your own high-availability, high-performance JSON-RPC client(s) (including Infura) or to use a decentralized and incentivized network of full nodes, so that should decentralize things a bit until we get to Serenity. See [DAppNode](https://dappnode.io/), [denode](https://github.com/ChainSafeSystems/denode), [Vipnode](https://vipnode.org/), and [Incubed](https://slock.it/incubed.html) by slock.it.

[`tasit-action` is the child package](/packages/tasit-action/) that implements these features for the Tasit SDK.

##### In the future

We have no plans until Serenity to make a special abstraction for running a local light geth node like Status did originally. The Tasit SDK works with whatever JSON-RPC client you point it at, but we won't be adding an abstraction for using a light client within the native mobile dapp until Serenity. People have had too many issues with this on mobile: dropped network connections, using all disk space, battery usage, etc.

Looking towards the future, light and ultralight client projects we're tracking for first-class support in this SDK include:

- [Nimbus](https://nimbus.status.im/) by Status
- [Mustekala](https://www.musteka.la/) by MetaMask
- [LightJS](https://github.com/paritytech/js-libs/tree/master/packages/light.js) by Parity

#### Tool for finding the address of a popular smart contract

The Tasit SDK also provides a standalone tool for discovering the current address of a high-profile dapp project’s primary smart contract interface. We detect the interface / ERC standard a smart contract implements using ERC-165 standard interface detection.

We also track the latest ABI and interface address for the most heavily used dapp projects directly via their open-source GitHub repos.

[`tasit-contracts` is the child package](/packages/tasit-contracts/) that implements these features for the Tasit SDK.

_This makes it simpler to customize the autogenerated app for a certain ERC standard and swap it to use with your own smart contracts or the already-on-chain smart contracts for a different dapp of that same ERC-type._

#### Serenity support

The Tasit SDK will work with the Ethereum Serenity release. We support Ethereum-based dapps to start, and in the long run the Tasit SDK will work with any blockchain that uses EVM and/or eWASM.

_In order for the Tasit SDK to make a difference for current and future users of Ethereum, it will need to support future versions of the EVM._

---

### Why?

#### Why (from the user's perspective)?

Today, using a dapp from a phone is painful. Almost no dapps have standalone mobile apps, and you're not easily able to use the dapp without ETH/tokens or with the ETH/tokens you have in another wallet. We lose mainstream people from the onboarding funnel because of this. Some dapps can be used inside a single app like Coinbase Wallet or Status that serves as a dapp browser, but this feels like a terribly broken UX for anyone who has been using a mobile phone for a while, and it also feels like broken UX for people who are used to using web-based dapps with MetaMask (where the wallet mostly stays out of the way until you need it). The ideal UX would be installing each mobile dapp in a way that feels the same as installing any mobile app, and giving it permission to take actions during onboarding with the costs subsidized by others or with your ETH/tokens held in a separate wallet.

The idea is that the Tasit SDK would be used by many different mobile apps on a user's device. Once the Tasit SDK is around, more dapps will have dedicated mobile apps. This will remove a key barrier to mainstream adoption of Ethereum dapps.

##### Right to exit for users

A single company's financial incentives determining how a software product works is a bummer for users. See Facebook's newsfeed changing to clickbait, or see Twitter users clamoring for simple changes to the product like spambot or harassment detection to no avail.

#### Why (from a developer's / Ethereum enthusiast's perspective)?

The user-facing answer for "Why?" focused on the UX/product, since that's the main thing that mainstream users care about. Here we'll touch on more technical/ideological arguments for why it's important that the Ethereum community creates more mobile dapps.

One major reason most dapps don’t have standalone mobile apps today is because it’s hard for developers to build mobile Ethereum dapps. There isn’t much good tooling for it. This SDK provides that tooling so that developers can focus on the "business logic" for their dapp.

Developers shouldn't need to reinvent the wheel for each new dapp: account and private key generation, linking to another wallet or adding meta-transaction support, etc. Let the Tasit SDK handle those parts for you.

There's no reason building an Ethereum dapp should feel much different for the front-end developer than building an app using Firebase as the back end - with the Tasit SDK, that's the case.

If you want to see the Ethereum ecosystem grow, mobile is critical for making that happen, because that's where all the users are.

##### Proof of decentralization

Tasit will serve as "proof of decentralization" for the dapps we support. Vitalik Buterin once tweeted 'One simple litmus test for whether or not a blockchain project is truly decentralized: can a third party independently make a client for it, and do everything that the "official" client can?'. We agree. It's time for major decoupling of "back end" and front end.

##### No platform risk

What's unique about the Ethereum ecosystem is that making a 3rd-party client is fully permissionless and interoperable, which means there's no risk that the developers of a smart contract can suddenly "throttle" users of their "API" in the way that would have been possible in web 2.0.

#### Why React Native?

The web-based front ends for most dapps these days are written with React, so using React Native for the native mobile version is a natural fit.

It's a common misconception that React Native is good for prototyping but not production - this isn't true! It's out of scope for this README to go into that, but we'd recommend doing some research to decide for yourself (setting aside any preconceived notions you may have first).

Most younger developers building interesting new mobile apps these days use React Native (and often Expo) to automatically support both iOS and Android, but there is little-to-no tooling for Ethereum in the React Native ecosystem.

---

### Contact us

We love getting feedback, so please feel free to reach out.

- [tasit.io](https://tasit.io/)

- [@TasitProject](https://twitter.com/TasitProject) on Twitter

- [Medium](https://medium.com/tasit)

- [Telegram](https://t.me/tasitlabs)

- [Email](mailto:founders@tasit.io)

- [Kanban board](https://github.com/orgs/tasitlabs/projects/1)

- [Feature requests](https://tasit.canny.io/feature-requests)
