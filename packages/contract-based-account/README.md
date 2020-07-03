# `@tasit/contract-based-account`

This package helps with onboarding a user using a smart-contract-based "account". Examples of such smart-contract-based accounts include the [Gnosis Safe](https://safe.gnosis.io/), [Universal Login](https://universallogin.io/), Argent, the Dharma smart wallet, Abridged, and Authereum.

This functionality all "lives" in `@tasit/contract-based-account`, a child package of [`tasit`](https://github.com/tasitlabs/tasit-sdk) that is also published to npm as a standalone module using [lerna](https://lerna.js.org/).

For context, [here is an overview](https://docs.tasit.io/docs/project-layout) of how this fits in with the rest of Tasit. But this can be used as a standalone, modular package if you prefer!

---

Note: This project was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).

## Local Development

Below is a list of commands you will probably find useful.

### `npm start`

Runs the project in development/watch mode. Your project will be rebuilt upon changes. TSDX has a special logger for you convenience. Error messages are pretty printed and formatted for compatibility VS Code's Problems tab.

Your library will be rebuilt if you make edits.

### `npm run build`

Bundles the package to the `dist` folder.
The package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).

### `npm run test:tsdx`

Runs the test watcher (Jest) in an interactive mode.
By default, runs tests related to files changed since the last commit.

### `npm run test:mocha-tsnode`

Runs the tests (written with mocha)
