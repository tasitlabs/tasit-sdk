---
id: getting-started
title: Getting started
sidebar_label: Getting started
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

[Go back to the home page of the docs](Home.md)
