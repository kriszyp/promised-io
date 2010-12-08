var assert = require("assert"),
	when = require("../lib/promise").when,
	whenPromise = require("../lib/promise").whenPromise,
	defer = require("../lib/promise").defer;

exports.testSpeedPlainValue = function(){
	for(var i = 0; i < 1000; i++){
		when(3, function(){
		});
	}
};

exports.testSpeedPromise = function(){
	var deferred = defer();
	for(var i = 0; i < 1000; i++){
		when(deferred.promise, function(){
		});
	}
	deferred.resolve(3);
};

exports.testWhenPromiseRejectHandled = function(){
	// The inner whenPromise doesn't have a rejectCallback, but the outer one does.
	// This means the error then *is* handled, but the inner whenPromise doesn't know about that.
	// This shouldn't result in an uncaught exception thrown by the promise library.
	whenPromise(true, function(){
		return whenPromise((function(){
			var deferred = defer();
			deferred.reject({});
			return deferred.promise;
		})());
	}).then(null, function(){});
};

if (require.main === module)
    require("patr/runner").run(exports);

