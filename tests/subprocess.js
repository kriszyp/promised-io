
var promise = require("../promise");
var subprocess = require("../subprocess");
var assert = require("assert"); // TODO why not roll patr into promised-io

// FIXME just testing a simple execute for now
promise.when(subprocess.execute("echo hello"), function(response) {
	assert.equal(response, "hello\n");
});
