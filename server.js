// TODO ML Configuration endpoint?

// npm install --save express
// npm install --save body-parser
// npm install --save better-sqlite3
const express = require('express')
const bodyParser = require('body-parser')
var Database = require('better-sqlite3');
var db = new Database('./data/data.sqlite3');
var fs = require('fs');
const app = express()
const port = 3000

app.use( bodyParser.json() );  
app.use(express.static('public'));

// TODO ML Read from file.
db.exec(`
CREATE TABLE IF NOT EXISTS times 
(id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT, duration INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);`);
db.exec(`
DROP TABLE IF EXISTS days;
CREATE TABLE days (id INT);
INSERT INTO days VALUES (0), (-1), (-2), (-3), (-4), (-5), (-6);
`);

app.get('/api', (request, response) => {
    // Call pattern ...?today=
    var today = request.query.today;
    if (!today) {
        today =  'now';
    }
    
    var result = db.prepare(`
    SELECT days.date AS date, IFNULL(SUM(times.duration),0) AS duration
    FROM (SELECT strftime('%Y-%m-%d', date(?, days.id || ' days')) AS date FROM days ORDER BY date ASC) days
    LEFT JOIN times ON days.date = strftime('%Y-%m-%d', date(times.timestamp))
    GROUP BY days.date`).all(today);
    response.send(result);
});

// TODO ML Might be able to use this as the general endpoint?
app.get('/api/detail', (request, response) => {
    // Call pattern ...?today=
    var today = request.query.today;
    if (!today) {
        today =  'now';
    }
    
    var result = db.prepare(`
    SELECT days.date AS date, times.description, IFNULL(SUM(times.duration),0) AS duration
    FROM (SELECT strftime('%Y-%m-%d', date(?, days.id || ' days')) AS date FROM days ORDER BY date ASC) days
    LEFT JOIN times ON days.date = strftime('%Y-%m-%d', date(times.timestamp))
    GROUP BY days.date, times.description;`).all(today);
    response.send(result);
});


app.get('/api/config', (request, response) => {
    var contents = fs.readFileSync('data/config.js').toString();
    response.setHeader("Content-Type", "application/json");
    response.send(contents);
});

app.get('/api/:date', (request, response) => {
    var date = request.params.date;
    var stmt = db.prepare(`
    SELECT * FROM times
    WHERE strftime('%Y-%m-%d', timestamp) = ?
    ORDER BY TIMESTAMP ASC`);
    var result = stmt.all(date);
    response.send(result);
});

app.get('/api/full', (request, response) => {
    var result = db.prepare(`select 
    description, duration, timestamp 
    from times order by timestamp`).all();
    response.send(result);
});

app.post('/api', (request, response) => {
    var data = request.body;
    console.log("'Saving' " + JSON.stringify(data));
    var stmt = db.prepare("INSERT INTO times (description, duration) VALUES (?, ?)");
    stmt.run(data.description, data.duration);
    response.send("OK");
});

app.listen(port, (err) => {
    if (err) {
        return console.log('Error starting server', err)
    }
    console.log(`Server is listening on ${port}`)
});