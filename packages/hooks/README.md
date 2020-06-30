# @tasit/hooks

This package assumes you have React as a peer dependency so that you can use these hooks. For example, `@tasit/hooks` includes the functionality of `@tasit/account` for generating accounts but in the form of a hook you can use directly in a React component.

## Commands

TSDX scaffolds your new library inside `/src`.

The recommended workflow is to run TSDX in one terminal:

```bash
npm start
```

This builds to `/dist` and runs the project in watch mode so any edits you save inside `src` causes a rebuild to `/dist`.

To do a one-off build, use `npm run build`.

To run tests, use `npm test`.

## Configuration

Code quality is set up with `prettier`, `husky`, and `lint-staged`.

### Jest

Jest tests are set up to run with `npm test`. This runs the test watcher (Jest) in an interactive mode. By default, runs tests related to files changed since the last commit.

#### Folder Structure

```shell
/src
  index.tsx
  index.test.tsx
.gitignore
package.json
README.md
tsconfig.json
```

### Bundler

The packages uses TSDX which uses [Rollup v1.x](https://rollupjs.org) as a bundler and generates multiple rollup configs for various module formats and build settings. See [Optimizations](#optimizations) for details.

## Optimizations

Please see the main `tsdx` [optimizations docs](https://github.com/palmerhq/tsdx#optimizations). In particular, know that you can take advantage of development-only optimizations:

```js
// ./types/index.d.ts
declare var __DEV__: boolean;

// inside your code...
if (__DEV__) {
  console.log('foo');
}
```

You can also choose to install and use [invariant](https://github.com/palmerhq/tsdx#invariant) and [warning](https://github.com/palmerhq/tsdx#warning) functions.

## Module Formats

CJS, ESModules, and UMD module formats are supported.

The appropriate paths are configured in `package.json` and `dist/index.js` accordingly. Please report if any issues are found.

## Named Exports

Per Palmer Group guidelines, [always use named exports.](https://github.com/palmerhq/typescript#exports) Code split inside your React app instead of your React library.

## Publishing to NPM

We recommend using [np](https://github.com/sindresorhus/np).

## Local development

Note: When you want to use the local version of this lib in an local Expo app while developing, refer to the metro config file used in the `account-example` app in the [`]tasit` repo](https://github.com/tasitlabs/tasit) and enable some settigs there that are disabled.

To make sure two versions of React aren't found, follow these instructions:

Your bundler might “see” two Reacts — one in the application folder and one in your library folder. One possible fix is to run `npm link ../../../tasit/apps/account-example/node_modules/react` from this dir, `tasit-sdk/packages/hooks`. This should make the library use the application’s React copy.

Note that depending on what dir your local app and this library are in, the number of `..`'s is likely to change.

(Source: https://reactjs.org/warnings/invalid-hook-call-warning.html towards the bottom)

