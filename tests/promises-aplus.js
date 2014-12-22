var lib = require("../promise");
var promisesAplusTests = require("promises-aplus-tests");

exports.adapter = {
	resolved: function (value) {
		var deferred = lib.defer();
		deferred.resolve(value);
		return deferred.promise;
	},
	rejected: function (reason) {
		try {
			var deferred = lib.defer();
			deferred.reject(reason);
			return deferred.promise;
		} catch (e) {}
	},
	deferred: function () {
		try {
			return lib.defer();
		}
		catch (e) {}
	}
};

function run(adapter, callback) {
	promisesAplusTests(adapter, callback);
}

if (require.main === module)
	run(exports.adapter, function () {});
