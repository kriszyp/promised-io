({define:typeof define!="undefined"?define:function(factory){factory(require,exports)}}).
define(function(require,exports){
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
	    var buffer = [];
	    for (var i = 0, length = arguments.length; i < length; i++) {
    	    var arg = arguments[i];
    	    if (arg) buffer.push(arg);
	    }
	    sys.puts(buffer.join(" "));
	}
	exports.dir = function(){
		for(var i=0,l=arguments.length;i<l;i++)
			sys.debug(sys.inspect(arguments[i]));
	}
}
else if(typeof navigator === "undefined"){
	try{
		exports.args = require("" + "system").args;
		exports.env = require("" + "system").env;
	}catch(e){
		// in raw rhino, we don't even have system
	}
	exports.print = print;
}
});