### How to get the code on your machine

Open your terminal

`cd` into a directory on your computer where you want to keep your code

Next you'll "clone" the code from GitHub.

`git clone https://github.com/tasitlabs/tasit-sdk.git`

`cd tasit-sdk`

For this project, `develop` is the name of the default branch for the project. That branch contains the latest code under development, and new changes should be contributed by making a pull request against the develop branch.

### Overview of architecture of the Tasit project

The `tasit-sdk` repo (the one you're looking at now) is the "middleware" code for interacting with the blockchain that you can use from within a React Native app. The code for our React Native mobile apps themselves is over in a different GitHub repo called `tasit-apps`.
There are multiple npm packages within this repo. It's a "monorepo" (feel free google this term for more info). We use [lerna](https://lerna.js.org/) to manage the packages. That's a popular technique.

### How to set up the local environment

You'll need to install the npm packages for this project before you can test it out. The code for those packages isn't in this repo - just the name and version of the packages that we use. Those are specified in the `package.json` file.

From within the `tasit-sdk` folder, run `npm run bootstrap`. You can see what that script does by looking at the `bootstrap` script in the `scripts` section of `package.json`. It uses a `lerna` command, using a tool called `npx` to run the locally installed version of lerna.

Note: If you've already used node and npm before and plan to work on multiple projects, we recommend using [nvm](https://github.com/creationix/nvm) to keep multiple versions on your machine. If you're just getting started with node and npm, that is probably overkill.

### Testing the current version of the code

We use test-driven development (TDD), so to make sure everything is set up right on your machine, the best way is to run the test suite. To do this, run:

`npm test`

Behind the scenes, this calls the `pretest` script before running `npm test`.

This will run the tests for all of the packages in this repo.

For each file in this repo - let's say it's named `file.ts` - we have a separate file named `file.test.ts` where we test the code in that file.

Some other projects keep all their tests in one big test directory, but we find that it's harder to visually confirm if all files are tested that way.

If you want to test only the package that you are working on, run `npm pretest` from the `tasit-sdk` folder and then run `npm test` from the package's folder.

The `pretest` script will start `buidler-evm` and deploy contracts from `@tasit/contracts`.

### Making some changes

We recommend using VS Code as your code editor. We use a tool called prettier to automatically format your code. We recommend configuring VS Code to format your code using prettier every time you save changes to a file.

If you don't want to use VS Code or use format on save, you can also run the linting script for one of the packages in the `packages` directory by `cd`'ing into that subdirectory and running `npm run lint`.

To make a change, first create a new feature branched named `feature/name-of-my-branch`. You can google how to do this using git if you're not familiar with this yet.

The workflow we follow is [this](https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow).

Once you've made changes to the code and/or made changes to the tests, make sure the linting and testing scripts are still working well on your local machine.

Once that's done, you're ready to create a PR (a pull request).

GitHub has some good guides on how to create a PR. When you create one, you'll be prompted to fill out our pull request template.

When a PR is opened from your feature branch, CircleCI will automatically run the linting script and the test suite to make sure that everything will still work if we merge your changes into the develop branch of the main repo on GitHub.

## Local development

Note: When you want to use the local version of `tasit` or a child package from the lerna monorepo like `@tasit/[package_name]` in a local Expo app while developing, refer to the metro config file used in the `account-example` app in the [`tasit-apps` repo](https://github.com/tasitlabs/tasit-apps) and enable some settigs there that are disabled.

To make sure two versions of React aren't found, follow these instructions:

Your bundler might “see” two Reacts — one in the application folder and one in your library folder. One possible fix is to run `npm link ../../../tasit-apps/apps/in-dapp-account/node_modules/react` from this dir, `tasit-sdk/packages/[package_name]`. This should make the library use the application’s React copy.

Note that depending on what dir your local app and this library are in, the number of `..`'s is likely to change.

(Source: https://reactjs.org/warnings/invalid-hook-call-warning.html towards the bottom)
