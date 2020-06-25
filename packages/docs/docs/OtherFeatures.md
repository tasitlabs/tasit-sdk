---
id: other-features
title: Other features
sidebar_label: Other features
---

#### Onboarding
- Simple integration of fiat onramps that let users use Apple Pay and Google pay

#### Ongoing UX
- ENS support
- Meta-transaction support
- Support for querying data using the The Graph

#### Mobile features
- Push notifications
- Biometric auth
- Deep linking

#### DevEx
- [Configurable JSON-RPC client](#configurable-json-rpc-client)

#### Future features
- [Eth 2.0 support](#eth-2-support)
- [L2 support](#l2-support)
- [A CLI for scaffolding a mobile dapp](#a-cli-for-scaffolding-a-mobile-dapp)
- [A library of native mobile dapp components](#a-library-of-native-mobile-dapp-components)


#### Configurable JSON-RPC client

We realize that different developers have different takes on whether it's an acceptable compromise to use Infura in the way that MetaMask does in the browser or whether a local Ethereum light client is warranted more like in the original version of Status or Augur. We anticipate that in the short term, almost all developers using this SDK will use Infura. It's a good stopgap solution for now.

We leave the JSON-RPC provider configurable so that the SDK doesn't take an opinionated stance on this.

There are a couple projects working to make it simple to spin up your own high-availability, high-performance JSON-RPC client(s) (including Infura) or to use a decentralized and incentivized network of full nodes, so that should decentralize things a bit until we get to Eth 2.0. See [DAppNode](https://dappnode.io/), [denode](https://github.com/ChainSafeSystems/denode), [Vipnode](https://vipnode.org/), and [Incubed](https://slock.it/incubed.html) by slock.it.

[`@tasit/action` is the child package](/packages/action/) that implements these features for the Tasit SDK.

##### In the future

We have no plans until Eth 2.0 to make a special abstraction for running a local light geth node like Status did originally. The Tasit SDK works with whatever JSON-RPC client you point it at, but we won't be adding an abstraction for using a light client within the native mobile dapp until Eth 2.0. People have had too many issues with this on mobile: dropped network connections, using all disk space, battery usage, etc.

Looking towards the future, light and ultralight client projects we're tracking for first-class support in this SDK include:

- [Nimbus](https://nimbus.status.im/) by Status
- [Mustekala](https://www.musteka.la/) by MetaMask
- [LightJS](https://github.com/paritytech/js-libs/tree/master/packages/light.js) by Parity

#### Eth 2.0 support

The Tasit SDK will work with the Ethereum 2.0 release. We support Ethereum-based dapps to start, and in the long run the Tasit SDK will work with any blockchain that uses EVM and/or eWASM.

_In order for the Tasit SDK to make a difference for current and future users of Ethereum, it will need to support future versions of the EVM._

#### L2 support

We're keeping an eye on various zk rollup projects and optimistic rollup projects like the OVM by [Optimism](https://optimism.io/).

#### Automatic scaffolding using the Tasit CLI

Are you starting a project from scratch? Let the Tasit CLI scaffold out your project for you. More details on this [here](https://github.com/tasitlabs/tasit#automatic-scaffolding-using-the-tasit-cli).

The Decentraland app generated using `tasit init --nft` ship with styled-but-customizable React Native components for using each feature of the dapp, leveraging the js middleware.

This feature lives over in our `tasit` repo - [details here](https://github.com/tasitlabs/tasit#automatic-scaffolding-using-the-tasit-cli) - since it's tightly integrated with the React Native mobile dapp codebase.

_This also makes the experience for new developers working on a mobile app with the Tasit SDK simpler, which also means more mobile dapps for end users._

#### A library of native mobile dapp components

This feature lives over in our `tasit` repo - [here](https://github.com/tasitlabs/tasit/tree/develop/shared) - since it's tightly integrated with the React Native mobile dapp codebase.

---

[Go back](Home.md) to the home page of the docs.
