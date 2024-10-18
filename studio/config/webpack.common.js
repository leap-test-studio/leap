const paths = require("./paths");
const path = require("path");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // extract css to files
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer"); // help tailwindcss to work
module.exports = {
  watchOptions: {
    ignored: [paths.node_modules, paths.build]
  },

  // Where webpack looks to start building the bundle
  entry: [paths.srcEntryFile],

  // Where webpack outputs the assets and bundles
  output: {
    path: paths.build,
    filename: "[name].bundle.js",
    publicPath: "http://localhost:5000/"
  },

  // Customize the webpack build process
  plugins: [
    // Removes/cleans build folders and unused assets when rebuilding
    new CleanWebpackPlugin(),

    new MiniCssExtractPlugin({
      filename: "styles/[name].css",
      chunkFilename: "[id].css"
    }),

    // Copies files from target to destination folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.srcAssets,
          to: "assets",
          globOptions: {
            ignore: ["*.DS_Store", path.join(paths.src, "index.css"), path.join(paths.src, "tailwind.css")]
          }
        }
      ]
    }),

    // Generates an HTML file from a template
    // Generates deprecation warning: https://github.com/jantimon/html-webpack-plugin/issues/1501
    new HtmlWebpackPlugin({
      favicon: paths.public + "/favicon.svg",
      template: paths.public + "/index.html", // template file
      filename: "index.html" // output file
    })
  ],

  // Determine how modules within the project are treated
  module: {
    rules: [
      {
        test: /\.(ts)x?$/,
        exclude: /node_modules|\.d\.ts$/, // this line as well
        use: {
          loader: "ts-loader",
          options: {
            compilerOptions: {
              noEmit: false // this option will solve the issue
            }
          }
        }
      },
      // JavaScript: Use Babel to transpile JavaScript files
      {
        test: /\.(js)x?$/,
        exclude: /node_modules/,
        resolve: {
          extensions: [".js", ".jsx", ".ts", ".tsx"]
        },
        use: ["babel-loader"]
      },

      // Styles: Inject CSS into the head with source maps
      {
        test: /\.(css|scss|sass)$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader", // postcss loader needed for tailwindcss
            options: {
              // javascriptEnabled: true,
              postcssOptions: {
                ident: "postcss",
                plugins: [tailwindcss, autoprefixer]
              }
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack"]
      },
      // Images: Copy image files to build folder
      { test: /\.(?:ico|gif|png|jpg|jpeg|mp4)$/i, type: "asset/resource" },
      // Fonts and SVGs: Inline files
      { test: /\.(woff(2)?|eot|ttf|otf|)$/, type: "asset/inline" }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"]
  }
};
