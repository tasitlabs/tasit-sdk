---
id: get-started
title: Get started
sidebar_label: Get started
---

You can use Tasit to create user-friendly mobile iOS and Android apps for a dapp using React Native.

Looking for the entry point for the `tasit` package? [That's here](https://github.com/tasitlabs/tasit-sdk/tree/develop/packages/sdk). Tasit is a collection of smaller packages exported as one using [lerna](https://lerna.js.org/).

## Installation

Getting started is as simple as running

`npm install --save tasit`

## Usage

Are you looking to add Ethereum-related functionality to a pre-existing app using Tasit?

Using Tasit from within your app is simple.
In `App.js` or the appropriate React Native component, import whichever APIs you need from Tasit.

```js
import { Account } from "tasit";
const burnerWallet = await Account.create();
const { address } = burnerWallet;
console.log(address); // '0x...'
// ...
```

Or maybe you want to interact with a contract:

```javascript
import { Contracts } from "tasit";

const { NFT } = Contracts;

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

## Modular

Tasit is designed with modularity in mind. Are you only planning on using Tasit for generating an ephemeral Ethereum acccount in your app? That works too!

You can install `@tasit/account` directly and keep your app's dependencies leaner.

```
npm install --save @tasit/account
```

Then the usage example from before becomes:

```javascript
import Account from "@tasit/account";
// ...
```

...with the rest of the code remaining the same.

---
