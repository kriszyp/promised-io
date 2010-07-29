if(typeof console !== "undefined"){
	exports.print = function(){
		console.log.apply(console, arguments);
	}
}
if(typeof process !== "undefined"){
	exports.args = process.argv;
	exports.env = process.env;	
	var sys = require("" + "sys");
	exports.print = function() {
	    sys.puts(Array.prototype.join.call(arguments, " "));
	}
	exports.dir = function(){
		for(var i=0,l=arguments.length;i<l;i++)
			sys.debug(sys.inspect(arguments[i]));
	}
}
else if(typeof navigator === "undefined"){
	exports.args = require("" + "system").args;
	exports.env = require("" + "system").env;
	exports.print = print;
}
