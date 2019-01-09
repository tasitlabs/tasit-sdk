# `tasit-contracts`

This package contains the smart contracts (and tests, etc.) from a few of the most popular dapps.

`tasit-contracts` contains a collection of the latest smart contracts from major projects that could be a useful standalone utility even when used outside of the context of the Tasit SDK. Other developers could use this package for testing their own libraries too.

**Important note**

This child package is still in a _coming soon_ state. If you're checking out this repo for the purposes of considering whether the code is up to your standards, here are some completed portions of the code base to check out:

- [tasit-action](../tasit-action)
- [tasit-account](../tasit-account)
- [The Tasit demo app using the Tasit SDK](https://github.com/tasitlabs/tasit/tree/develop/demo)

This functionality all "lives" in `tasit-contracts`, a child package of the [`tasit-sdk`](https://github.com/tasitlabs/TasitSDK) that is also published to npm as a standalone module using [lerna](https://lernajs.io/).

[For context, here is an overview](../../README.md#tool-for-finding-the-address-of-a-popular-smart-contract) of how this fits in with the rest of the Tasit SDK. But this can be used as a stand-alone, modular package if you prefer!
