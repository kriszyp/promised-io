/**
* HTTP Client using the JSGI standard objects
*/
var defer = require("../../../lib/promise").defer,
	when = require("../../../lib/promise").when,
	LazyArray = require("../../../lib/lazy-array").LazyArray,
	http = require("http"),
	parse = require("url").parse;

// configurable proxy server setting, defaults to http_proxy env var
exports.proxyServer = require("../../../lib/process").env.http_proxy;

exports.request = function(originalRequest){
	// make a shallow copy of original request object
	var request = {};
	for(var key in originalRequest){
		if(originalRequest.hasOwnProperty(key)){
			request[key] = originalRequest[key];
		}
	}
	
	if(request.url){
		var parsed = parse(request.url);
		if (parsed.pathname) {
			parsed.pathInfo = parsed.pathname;
		} else {
			parsed.pathInfo = "/";
		}
		request.queryString = parsed.query || "";
		for(var i in parsed){
			request[i] = parsed[i];
		}
	}
	var deferred = defer();
	if(exports.proxyServer){
		request.pathname = request.url;
		var proxySettings = parse(exports.proxyServer);
		request.port = proxySettings.port; 
		request.protocol = proxySettings.protocol;
		request.hostname = proxySettings.hostname;
	}
	
	var secure = request.protocol.indexOf("s") > -1;
	var client = http.createClient(request.port || (secure ? 443 : 80), request.hostname, secure);
	var timedOut, bodyDeferred;
	client.on("error", function(error){
		if(bodyDeferred){
			bodyDeferred.reject(error);
		}else{
			deferred.reject(error);
		}
		clearTimeout(timeout);
	});
	// Limits the time of sending the request + receiving the response header to 20 seconds.
	// No timeout is used on the client stream, but we do destroy the stream if a timeout is reached.
	var timeout = setTimeout(function(){
		timedOut = true;
		client.destroy();
		deferred.reject(new Error("Timeout"));
	}, 20000);

	var requestPath = request.pathname || request.pathInfo || "";
	if (request.queryString) {
	  requestPath += "?"+request.queryString;
	}

	var req = client.request(request.method || "GET", requestPath, request.headers || 
		{host: request.host || request.hostname + (request.port ? ":" + request.port : "")});
	req.on("response", function (response){
		if(timedOut){
			return;
		}
		response.status = response.statusCode;
		var sendData = function(block){
			buffer.push(block);
		};
		var buffer = [];
		bodyDeferred = defer();
		var body = response.body = LazyArray({
			some: function(callback){
				buffer.forEach(callback);
				sendData = callback;
				return bodyDeferred.promise;
			}
		});
		response.setEncoding(request.encoding || "utf8");

		response.on("data", function (chunk) {
			sendData(chunk);
		});
		response.on("end", function(){
			bodyDeferred.resolve();
			// Since we have no connection pooling, let's not pretend to use Keep-Alive
			client.end();
		});
		deferred.resolve(response);
		clearTimeout(timeout);
	});
	if(request.body){
		return when(request.body.forEach(function(block){
			req.write(block);
		}), function(){
			req.end();
			return deferred.promise;
		});
	}else{
		req.end();
		return deferred.promise;
	}
};
