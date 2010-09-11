var assert = require("assert"),
	when = require("promise").when,
	defer = require("promise").defer;

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

if (require.main === module)
    require("patr/runner").run(exports);

