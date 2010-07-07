/**
* HTTP Client using the JSGI standard objects
*/
// configurable proxy server setting, defaults to http_proxy env var
exports.proxyServer = require("./system").env.http_proxy;

exports.request = function(request){
	var url = new java.net.URL(request.url),
		connection = url.openConnection();
	connection.setDoInput(true);
	connection.setRequestMethod(request.method);

	for (var header in this.headers) {
		var value = this.headers[header];
		connection.addRequestProperty(String(header), String(value));
	}

    var input = null;
    try {
    	if (request.body) {
			connection.setDoOutput(true);
			var os = connection.getOutputStream();
			request.body.forEach(function(part){
				os.write(java.lang.String(part).toBytes("UTF-8"));
			});
			os.close();
    	}
    
        connection.connect();
		var input = new java.io.InputStreamReader(connection.getInputStream(), "UTF-8");
    } catch (e) {
        // HttpUrlConnection will throw FileNotFoundException on 404 errors. FIXME: others?
        if (e.javaException instanceof java.io.FileNotFoundException)
            is = connection.getErrorStream();
        else
            throw e;
    }

    var status = Number(connection.getResponseCode());
	var headers = {};
    for (var i = 0;; i++) {
        var key = connection.getHeaderFieldKey(i),
            value = connection.getHeaderField(i);
        if (!key && !value)
            break;
        // returns the HTTP status code with no key, ignore it.
        if (key)
            headers[String(key).toLowerCase()] = String(value);
    }
    var body = [];
    var cbuf = new java.lang["char"](1024);
    var read = 0;
	while(read > -1){
		read = reader.read(cbuf,0,1024);
		if(read > -1){
			body.push(new java.lang.String(cbuf));
		}
	}
	return {
		status: status,
		headers: headers,
		body: body
	};
};
