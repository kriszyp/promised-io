var File = require("file");
exports.readFileSync = exports.read = File.read;
exports.writeFileSync = exports.write = File.write;
exports.statSync = File.stat;

exports.makeTree = File.mkdirs;
exports.makeDirectory = File.mkdir;