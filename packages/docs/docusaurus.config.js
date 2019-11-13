/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  title: "Tasit SDK",
  tagline: "Docs",
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
        { to: "docs/home", label: "Docs", position: "left" },
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
          title: "Tech",
          items: [
            {
              label: "Docs",
              to: "docs/home",
            },
            {
              label: "Kanban board",
              href: "https://github.com/orgs/tasitlabs/projects/1",
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
            {
              label: "Feature requests",
              href: "http://feedback.tasit.io/feature-requests",
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
            {
              label: "Medium",
              href: "https://medium.com/tasit",
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
