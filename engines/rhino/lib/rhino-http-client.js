/**
* HTTP Client using the JSGI standard objects
*/
// configurable proxy server setting, defaults to http_proxy env var
exports.proxyServer = require("./process").env.http_proxy;

exports.request = function(request){
	var uri = new java.net.URL(request.uri),
		connection = uri.openConnection(),
		method = request.method || "GET";
		
	if (request.body && typeof request.body.forEach === "function") {
		if (!request.method) method = "POST";
		var writer = new java.io.OutputStreamWriter(conn.getOutputStream());
		request.body.forEach(function(chunk) {
			writer.write(chunk);
			writer.flush();
		});
	}
	
	connection.setDoInput(true);
	connection.setRequestMethod(method);
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
		input = connection.getInputStream();
	} catch (e) {
		// HttpUrlConnection will throw FileNotFoundException on 404 errors. FIXME: others?
		if (e.javaException instanceof java.io.FileNotFoundException)
			input = connection.getErrorStream();
		else
			throw e;
	}
	
	var status = Number(connection.getResponseCode()),
		headers = {};
	for (var i = 0;; i++) {
		var key = connection.getHeaderFieldKey(i),
			value = connection.getHeaderField(i);
		if (!key && !value)
			break;
		// returns the HTTP status code with no key, ignore it.
		if (key) {
			key = String(key).toLowerCase();
			value = String(value);
			if (headers[key]) {
				if (!Array.isArray(headers[key])) headers[key] = [headers[key]];
				headers[key].push(value);
			}
			else {
				headers[key] = value;
			}
		}
	}
	
	var reader = new java.io.BufferedReader(new java.io.InputStreamReader(input)),
		builder = new java.lang.StringBuilder(),
		line;
	while((line = reader.readLine()) != null){
		builder.append(line + '\n');
	}
	if (typeof writer !== "undefined") writer.close();
	reader.close();
	
	return {
		status: status,
		headers: headers,
		body: [builder.toString()]
	};
};
