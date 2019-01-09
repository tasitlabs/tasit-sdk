# `tasit-identity-contract`

This package helps with onboarding a user using a smart-contract-based identity. Examples of such smart-contract-based identities include the [Gnosis Safe](https://safe.gnosis.io/) and [universal login](https://universallogin.io/).

**Important note**

This onboarding-related child package is still in a _coming soon_ state. If you're checking out this repo for the purposes of considering whether the code is up to your standards, here are some completed portions of the code base to check out:

- [tasit-action](../tasit-action)
- [tasit-account](../tasit-account)
- [The Tasit demo app using the Tasit SDK](https://github.com/tasitlabs/tasit/tree/develop/demo)

This functionality all "lives" in `tasit-identity-contract`, a child package of the [`tasit-sdk`](https://github.com/tasitlabs/TasitSDK) that is also published to npm as a standalone module using [lerna](https://lernajs.io/).

[For context, here is an overview](../../README.md#for-users-new-to-ethereum-with-no-funds) of how this fits in with the rest of the Tasit SDK in the [onboarding section](../../README.md#onboarding). But this can be used as a stand-alone, modular package if you prefer!
