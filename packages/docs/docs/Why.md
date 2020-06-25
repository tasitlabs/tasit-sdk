---
id: why
title: Why
sidebar_label: Why
---

### Why should this thing exist?

#### A bit skeptical about the need for mobile dapps?

- [Why (from the user's perspective)?](Why.md#why-from-the-users-perspective)

- [Why (from a developer's / Ethereum enthusiast’s perspective)?](Why.md#why-from-a-developers--ethereum-enthusiasts-perspective)

- [Why React Native?](Why.md#why-react-native)

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

[Go back](Home.md) to the home page of the docs.
