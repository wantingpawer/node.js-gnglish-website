'use strict';
const port = process.env.PORT || 1337;

const fs = require('fs');
const express = require('express');
const sql = require('mysql');

const app = express();

const connection = sql.createConnection({
	host: 'localhost',
	user: 'server',
	database: 'gnglish'
}).connect((err) => {
	if (err) throw err;
	console.log('Connected!');
})

app.get('/', (req, res) => {
	fs.readFile('html/index.html', (err, data) => {
		if (err) throw err;
		res.status(200);
		res.header('Content-Type', 'text/html');
		res.write(data);
		res.end();
	});
});

app.get('/words', (req, res) => {

})

app.listen(port);