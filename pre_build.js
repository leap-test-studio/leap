const fs = require("fs");
const path = require("path");

const now = new Date();

let isOktaEnabled = true;

const Product = {
  name: "LEAP",
  description: "LEAN ENTERPRISE AUTOMATION PLATFORM",
  version: "1.0.0",
  page: {
    urlPrefix: "/studio",
    landingPage: "/dashboard",
    projectsListPage: "/projects",
  },
  isOktaEnabled,
  build: {
    id: "0",
    date: now.toUTCString(),
    host: "127.0.0.1",
  },
  copyrightYear: now.getFullYear(),
  organization: {
    name: "Rakuten Rewards",
    address: "",
  },
  website: "https://leap.dataplatform-np.rr-it.com",
  docBaseURL: "/documentation",
};

if (process.argv.length >= 3) {
  Product.build.id = process.argv[2];
}

if (process.argv.length >= 4) {
  Product.isOktaEnabled = Boolean(process.argv[3]);
}

const dump = JSON.stringify(Product, null, 2);

if (fs.existsSync(path.join(__dirname, "src"))) {
  fs.writeFileSync(path.join(__dirname, "src", "product.json"), dump);
} else {
  fs.writeFileSync(path.join(__dirname, "studio", "src", "product.json"), dump);
  fs.writeFileSync(
    path.join(__dirname, "documentation", "src", "product.json"),
    dump
  );
}
