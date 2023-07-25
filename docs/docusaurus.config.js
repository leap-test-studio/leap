// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
const Product = require("./src/product.json");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: Product.name,
  tagline: Product.description,
  url: Product.website,
  baseUrl: Product.baseURL + "/docs/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "/icons/favicon.svg",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: Product.organization.name, // Usually your GitHub org/user name.
  projectName: Product.name, // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
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
      colorMode: {
        defaultMode: "light",
        disableSwitch: true
      },
      navbar: {
        title: Product.name,
        logo: {
          alt: Product.name + " Logo",
          src: `/img/logo.png`,
          srcDark: `/img/logo.png`,
          href: Product.baseURL + "/docs/",
          target: "_self",
          width: 30,
          height: 30
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Product"
          },
          { to: "/blog", label: "Notes", position: "left" }
        ]
      },
      footer: {
        style: "dark",
        logo: {
          alt: Product.name + " Logo",
          src: `/img/logo.png`,
          srcDark: `/img/logo.png`,
          href: Product.baseURL + "/docs/",
          width: 40,
          height: 40
        },
        copyright: `Copyright © ${Product.copyrightYear} ${Product.organization.name}. All rights reserved.`
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      }
    })
};

module.exports = config;
