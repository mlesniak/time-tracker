// TODO ML Configuration endpoint?

// npm install --save express
// npm install --save body-parser
// npm install --save better-sqlite3
const express = require('express')
const bodyParser = require('body-parser')
var Database = require('better-sqlite3');
var db = new Database('./data.sqlite3');
const app = express()
const port = 3000

app.use( bodyParser.json() );  
app.use(express.static('public'));

db.exec(`CREATE TABLE IF NOT EXISTS times 
(id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT, duration INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);`);

app.get('/api', (request, response) => {
    var result = db.prepare(`select 
    sum(duration) as duration, 
    strftime('%d-%m-%Y',timestamp) as date
    from times group by date order by date desc limit 7`).all();
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