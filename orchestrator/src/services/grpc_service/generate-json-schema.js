const protobufjsJsonschema = require("protobuf-jsonschema");
const fs = require("fs");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "example.proto");

const helloRequestSchema = protobufjsJsonschema(PROTO_PATH);

fs.writeFileSync("example.json", JSON.stringify(helloRequestSchema, null, 2));

console.log("JSON Schemas generated successfully.");
