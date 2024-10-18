// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";
const Product = require("./src/product.json");
/** @type {import('@docusaurus/types').Config} */
const config = {
  title: Product.name,
  tagline: Product.description,
  url: Product.website,
  baseUrl: Product.docBaseURL,
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "icons/favicon.png",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: Product.organization.name, // Usually your GitHub org/user name.
  projectName: Product.name, // Usually your repo name.

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"]
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js")
        },
        blog: {
          showReadingTime: true
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css")
        }
      })
    ]
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      navbar: {
        title: Product.name,
        logo: {
          alt: "Logo",
          src: "icons/favicon.png",
          srcDark: "icons/favicon.png",
          href: "/documentation/",
          target: "_self",
          width: 30,
          height: 30
        },
        items: []
      },
      footer: {
        style: "dark",
        logo: {
          alt: Product.name + " Logo",
          src: "icons/favicon.png",
          srcDark: "icons/favicon.png",
          href: "/documentation/",
          width: 40,
          height: 40
        },
        copyright: `Copyright © ${Product.copyrightYear} ${Product.organization.name}. All rights reserved.`
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula
      }
    })
};

export default config;
