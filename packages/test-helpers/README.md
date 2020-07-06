# @tasit/test-helpers

This package contains some shared testing utils that will come in handy in the tests for `@tasit/action`, `@tasit/account`, etc.

## Local Development

Below is a list of commands you will probably find useful.

### `npm start`

Runs the project in development/watch mode. Your project will be rebuilt upon changes. Error messages are pretty printed and formatted for compatibility VS Code's Problems tab.

The library will be rebuilt if you make edits.

### `npm run build`

Bundles the package to the `dist` folder.
The package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).

### `npm test`

Runs the test watcher (Jest) in an interactive mode.
By default, runs tests related to files changed since the last commit.
