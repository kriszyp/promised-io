var defer = require("./promise").defer;

// TODO pull bits from narwhal and get running on raw rhino
try {
    var childProcess = require("child_process");
}
catch (e) {
    // TODO needs console module 
    //require("./console").warn("The child-process module not supported on your platform");
}


exports.spawn = function() {
    var _child = childProcess.spawn.apply(this, arguments);
    
    // TODO use es5-shim?
    var child = Object.create(_child);
    
    // node's child.kill should really be raise -- let's correcting this oversight
    child.raise = function() {
        _child.kill.apply(_child, arguments);
    };
    
    // TODO promisify streams
    [ "stdin", "stdout", "stderr" ].forEach(function(key, i) {
        child[key] = _child[key];
        child[key].fd = _child.fds[i];
    });
    
    return child;
};


exports.execute = function(command, options) {
    // TODO isA check for path-like object in command to do childProcess.execFile?
    var deferred = defer();
    var callback = function(e, stdout, stderr) {
        options = options || {};
        if (e != null) deferred.reject(e);
        else if (options.verbose) deferred.resolve({stdout: stdout, stderr: stderr});
        else deferred.resolve(stdout);
    };
    childProcess.exec(command, options, callback);
    return deferred.promise;
};
