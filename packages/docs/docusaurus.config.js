/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  title: "Tasit SDK",
  tagline: "Tasit SDK docs",
  url: "https://docs.tasit.io",
  baseUrl: "/",
  favicon: "img/favicon-32x32.png",
  organizationName: "tasitlabs", // Usually your GitHub org/user name.
  projectName: "TasitSDK", // Usually your repo name.
  themeConfig: {
    navbar: {
      title: "Tasit SDK",
      logo: {
        alt: "Tasit Logo",
        src: "img/TasitLogoSvg.svg",
      },
      links: [
        { to: "docs/home", label: "Home", position: "left" },
        {
          to: "docs/getting-started",
          label: "Get started",
          position: "left",
        },
        { to: "docs/main-features", label: "Features", position: "left" },
        {
          to: "docs/why",
          label: "Why",
          position: "left",
        },
        {
          to: "docs/contact",
          label: "Contact",
          position: "left",
        },
        {
          href: "https://github.com/tasitlabs/tasitsdk",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Docs",
              to: "docs/home",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Telegram",
              href: "https://t.me/tasitlabs",
            },
          ],
        },
        {
          title: "Social",
          items: [
            {
              label: "Twitter",
              href: "https://twitter.com/TasitProject",
            },
          ],
        },
      ],
      logo: {
        alt: "Tasit Logo",
        src:
          "https://raw.githubusercontent.com/tasitlabs/TasitSDK/develop/docs/images/TasitLogoBlack.png",
      },
      copyright: `Copyright © ${new Date().getFullYear()} Tasit`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
