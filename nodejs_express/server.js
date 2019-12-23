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
		console.log(`Request from ${req.connection.remoteAddress || req.headers['x-forwarded.for']}`)
		res.status(200);
		res.header('Content-Type', 'text/html');
		res.write(data);
		res.end();
	});
});

app.get('/words', (req, res) => {
	fs.readFile('html/view_dict.html', (err, data) => {
		if (err) throw err;
		res.status(200);
		res.header('Content-Type', 'text/html');
		res.write(data);
		res.end();
	});
});

app.get('/add', (req, res) => {
	fs.readFile('html/add_gnglish_words.html', (err, data) => {
		if (err) throw err;
		res.status(200);
		res.header('Content-Type', 'text/html');
		res.write(data);
		res.end();
	});
});

app.post('/add', (req, res) => {
	var body = "";
	req.on("data", (data) => {
		body += data;
		if (body.length > 1e6) {
			console.log(`Faulty connection from ${req.connection.remoteAddress || req.headers['x-forwarded.for']}`);
			req.connection.destroy();
		}
	});
	req.on("end", () => {
		console.log(body);
		var word, translation, context, password;
		var newBody = body.split("&");
		newBody.forEach((item, index) => {
			switch (index) {
				case 0:
					word = item.split("=")[1];
					break;
				case 1:
					translation = item.split("=")[1];
					break;
				case 2:
					context = item.split("=")[1];
					break;
				case 3:
					password = item.split("=")[1];
					break;
			}
		});
		const priv_connection = sql.createConnection({
			host: 'localhost',
			user: 'priv_user',
			database: 'gnglish',
			password: password
		});
		priv_connection.connect((err) => {
			if (err) {
				res.write(`An error occured (possibly wrong password)\n${err}`);
				res.end();
			} else {
				priv_connection.query(`INSERT INTO gnglishwords(word, translation, wordContext) VALUES ("${word}", "${translation}", "${context}");`, (result) => {
					console.log(`Query Inserted\n${result}`);
					res.redirect("/add");
					res.end();
				});
			}
		});
	});
});

app.listen(port);