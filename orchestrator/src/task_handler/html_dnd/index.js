const util = require("util");
const fs = require("fs");
const multiline = require("multiline");
const path = require("path");

const BASE_DIR = __dirname;
const CODE_FILE = path.join(BASE_DIR, "html_dnd.js");
const CoreCode = fs.readFileSync(CODE_FILE, { encoding: "utf8" });

module.exports = util.format(
  multiline(function () {
    /*
        (function (draggable, droppable, config) {
        %s;
          dnd.simulate(draggable, droppable, config);
        })(arguments[0], arguments[1], arguments[2]);
    */
  }),
  CoreCode
);
