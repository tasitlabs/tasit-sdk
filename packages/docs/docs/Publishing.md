---
id: publishing
title: (Internal docs) Publishing
sidebar_label: (Internal docs) Publishing
---

### Publishing new versions

**Note: This doc is mainly useful for the Tasit team to publish new versions of Tasit, not for a team using Tasit.**

1. Create a publish issue on GitHub (with the desired new version number in the name).

1. Create a new branch (e.g. `feature/publish-1-2-3`) from an updated `develop` branch.

1. Run `npm run publish` script

   This script will clean packages, install dependencies, compile and test all packages. If all these steps run without error, the `lerna publish` routine will be called and a prompt will be shown:


    ```
    ? Select a new version (currently 0.0.7) (Use arrow keys)
    ❯ Patch (0.0.8)
      Minor (0.1.0)
      Major (1.0.0)
      Prepatch (0.0.8-alpha.0)
      Preminor (0.1.0-alpha.0)
      Premajor (1.0.0-alpha.0)
      Custom Prerelease
      Custom Version
    ```

1. After the selection of the correct option, the packages that are about to have new versions published are listed:


    ```
    ? Select a new version (currently 0.0.7) Patch (0.0.8)

    Changes:
     - @tasit/account: 0.0.7 => 0.0.8
     - @tasit/action: 0.0.7 => 0.0.8
     - @tasit/contracts: 0.0.7 => 0.0.8
     - tasit: 0.0.7 => 0.0.8

    ? Are you sure you want to publish these packages? (ynH)
    ```

1. If that's correct, press `y` to publish the packages.

1. During the publishing process, Lerna will update the `package.json` files with the new version and push changes to the GitHub repository (and to npm, of course).

1. If that was successful, create a new PR that auto-closes the issue created in step 1.

**Troubleshooting**

Sometimes during the `lerna bootstrap` process, the file `package-lock.json` can be changed, and that will make `lerna publish` abort. Publishing will only be done if there are no unstaged files in the `git` repo. To solve that, commit the file and run the `publish` script again.

---

[Go back](Home.md) to the home page of the docs.
