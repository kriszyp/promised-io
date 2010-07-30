var File = require("file"),
	LazyArray = require("./lazy-array").LazyArray,
    defer = require("./promise").defer;
exports.readFileSync = exports.read = File.read;
exports.writeFileSync = exports.write = File.write;
exports.stat = exports.statSync = function(path) {
    var stat = File.stat.apply(null, arguments);
    stat.isFile = function() {
        return File.isFile(path);
    }
    return stat;
}

exports.makeTree = File.mkdirs;
exports.makeDirectory = File.mkdir;

exports.open = function(){
	var file = File.open.apply(this, arguments);
	var array = LazyArray({
		some: function(callback){
			while(true){
				var buffer = file.read(4096);
				if(buffer.length <= 0){
					return;
				}
				if(callback(buffer)){
					return;
				}
			}
		}
	});
	for(var i in array){
		file[i] = array[i];
	}
	return file;
}
exports.createWriteStream = function(path, options) {
    options = options || {};
    options.flags = options.flags || "w";
    var flags = options.flags || "w",
        f = File.open(path, flags);
    return {
        writable: true,
        write: function() {
            var deferred = defer();
            try {
                f.write.apply(this, arguments);
                f.flush();
            }
            catch (e) {
                return stream.writable = false;
            }
            deferred.resolve();
            return deferred.promise;
        },
        end: f.close,
        destroy: f.close
    }
}
