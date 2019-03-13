# `tasit-link-wallet`

This package helps with onboarding a user by linking a dapp with a wallet of their choosing. This can be done either using ERC20 and ERC721 approve functions or using WalletConnect.

This functionality all "lives" in `tasit-link-wallet`, a child package of the [`tasit-sdk`](https://github.com/tasitlabs/TasitSDK) that is also published to npm as a standalone module using [lerna](https://lernajs.io/).

[For context, here is an overview](../../README.md#for-users-that-do-have-funds) of how this fits in with the rest of the Tasit SDK in the [onboarding section](../../README.md#onboarding). But this can be used as a stand-alone, modular package if you prefer!
