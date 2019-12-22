'use strict';
const http = require('http');
const port = process.env.PORT || 1337;
const express = 

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
}).listen(port);
