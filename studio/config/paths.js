const path = require("path");

module.exports = {
  // Source files
  src: path.resolve(__dirname, "../src"),

  srcEntryFile: path.resolve(__dirname, "../src", "index.jsx"),

  srcAssets: path.resolve(__dirname, "../src", "assets"),

  // Production build files
  build: path.resolve(__dirname, "../build"),

  // Static files that get copied to build folder
  public: path.resolve(__dirname, "../public"),

  node_modules: path.resolve(__dirname, "../node_modules"),

  envFile: path.resolve(__dirname, "../", ".env"),

  envProdFile: path.resolve(__dirname, "../", ".env.production"),

  envLocalFile: path.resolve(__dirname, "../", ".env.development")
};
