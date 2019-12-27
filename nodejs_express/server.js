'use strict';
const port = process.env.PORT || 1337;

const fs = require('fs');
const express = require('express');
const sql = require('mysql');

const app = express();

app.get('/', (req, res) => {
	fs.readFile('html/index.html', (err, data) => {
		if (err) throw err;
		console.log(`\nRequest from ${req.connection.remoteAddress || req.headers['x-forwarded.for']}\n`)
		res.status(200);
		res.header('Content-Type', 'text/html');
		res.write(data);
		res.end();
	});
});

app.get('/words', (req, res) => {
	fs.readFile('html/view_dict.html', (err, data) => {
		if (err) throw err;
		try {
			const connection = sql.createConnection({
				host: 'localhost',
				user: 'server',
				database: 'gnglish'
			});
			connection.connect((err) => {
				if (err) throw err;
				connection.query(`SELECT * FROM gnglishwords;`, (err, result) => {
					if (err) throw err;
					console.log(result);
				});
			});
		} catch (err) {
			console.log(err)
		}
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
			console.log(`\nFaulty connection from ${req.connection.remoteAddress || req.headers['x-forwarded.for']}\n`);
			req.connection.destroy();
		}
	});
	req.on("end", () => {
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
		console.log(`An input of\nword: ${word}\ntranslation: ${translation}\ncontext: ${context}\nwas received\n`);
		const priv_connection = sql.createConnection({
			host: 'localhost',
			user: 'priv_user',
			database: 'gnglish',
			password: password
		});
		priv_connection.connect((err) => {
			if (err) {
				res.write(`An error occured (possibly wrong password)\n${err}`);
				console.log(`Incorrect password of "${password}" was entered\n`)
				res.end();
			} else {
				console.log("Connection created! Password correct.")
				const sql = `INSERT INTO gnglishwords(word, translation, wordContext) VALUES (?, ?, ?);`
				priv_connection.query(sql, [word, translation, context], (err, result) => {
					console.log(`Query Inserted\n`);
					res.redirect("/add");
					res.end();
				});
			}
		});
	});
});

app.listen(port);