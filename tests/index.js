exports.testOAuth = require('./oauth');
exports.testPromise = require('./promise');
exports.testQuerystring = require('./querystring');

if (require.main === module)
    require("patr/runner").run(exports);