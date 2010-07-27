/**
* HTTP Client using the JSGI standard objects
*/
var defer = require("promised-io/promise").defer,
	when = require("promised-io/promise").when;
if(typeof XMLHttpRequest === "undefined"){
	exports.request = require("../engines/node/lib/http-client").request;
}
else{
exports.request = function(request){
	var xhr = new XMLHttpRequest();
	xhr.open(request.method || "GET", 
		request.url || // allow request.url to shortcut creating a URL from all the various parts 
		(request.scheme + "://" + request.serverName + ":" + request.serverPort + request.pathInfo + (request.queryString ? '?' + request.queryString : '')), true);
	for(var i in request.headers){
		xhr.setRequestHeader(i, request.headers[i]);
	}
	var deferred = defer();
	var response;
	var lastUpdate;
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4 || xhr.readyState == 3){
			if(!response){
				response = {
					body: [xhr.responseText],
					status: xhr.status,
					headers: {}
				};
				lastUpdate = xhr.responseText.length;
				var headers = xhr.getAllResponseHeaders();
				headers = headers.split(/\n/);
				for(var i = 0; i < headers.length; i++){
					var nameValue = headers[i].split(": ", 2);
					if(nameValue){
						var name = nameValue[0];
						response.headers[name.toLowerCase()] = xhr.getResponseHeader(name);
					}
				}
			}
			else{
				response.body = [xhr.responseText];
				lastUpdate = xhr.responseText.length;
			}
			if(xhr.readyState == 4){
				deferred.resolve(response);
			}
			else{
				deferred.progress(response);
			}
		}
	}
	xhr.send(request.body && request.body.toString());
	return deferred.promise;
}
}

exports.Redirect = function(nextApp, maxRedirects) {
	maxRedirects = maxRedirects || 10;
	return function(request) {
		var remaining = maxRedirects,
			deferred = defer();
		function next() {
			when(nextApp(request), function(response) {
				if (remaining--) {
					// FIXME this is very naive
					// TODO cache safe redirects when cache is added
					if ([301,302,303,307].indexOf(response.status) >= 0) {
						request.url = response.headers.location;
						next();
					}
					else {
						deferred.resolve(response);
					}
				}
				else {
					deferred.resolve(response);
				}
			}, deferred.reject);
		}
		next();
		return deferred.promise;
	}
}

// TODO exports.Cache

// TODO exports.CookieJar

exports.Client = function(options) {
	if (!(this instanceof exports.Client)) return new exports.Client(options);
	options = options || {};
	for (var key in options) {
		this[key] = options[key];
	}
	this.request = exports.request;
	// turn on redirects by default
	var redirects = "redirects" in this ? this.redirects : 10;
	if (redirects) {
		this.request = exports.Redirect(this.request, typeof redirects === "number" && redirects);
	}
	
	var finalRequest = this.request;
	this.request = function(options) {
		if (typeof options === "string") options = {url: options};
		return finalRequest(options);
	}
}
