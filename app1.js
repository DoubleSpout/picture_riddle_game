/*
 * BAE Node.js application demo
 */

/* Port which provided by BAE platform */
var port = process.env.APP_PORT;

/*
 * Create an HTTP server
 * which is as similar as http://nodejs.org/api/http.html mentioned
 */

var http = require('http');

var server = http.createServer(function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });

    var body = '<html>' + '<body>' +
               '<h1>Welcome to Baidu Cloud!</h1>' +
               '</body>' + '</html>';

    res.end(body);
});

server.listen(port);

/* Enjoy it! */
