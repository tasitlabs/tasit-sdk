# provider-helpers

## Local Development

Below is a list of commands you will probably find useful.

### `npm start`

Runs the project in development/watch mode. Your project will be rebuilt upon changes. TSDX has a special logger for you convenience. Error messages are pretty printed and formatted for compatibility VS Code's Problems tab.

Your library will be rebuilt if you make edits.

### `npm run build`

Bundles the package to the `dist` folder.
The package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).

### `npm test`

Runs the test watcher (Jest) in an interactive mode.
By default, runs tests related to files changed since the last commit.
