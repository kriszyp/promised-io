if(typeof console !== "undefined"){
	exports.print = function(){
		console.log.apply(console, arguments);
	}
}
if(typeof process !== "undefined"){
	exports.args = process.argv;
	exports.env = process.env;	
	exports.print = require("sys").puts;
}
else{
	exports.args = require("system").args;
	exports.env = require("system").env;
	exports.print = print;
}
