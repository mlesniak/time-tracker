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
    description, 
    sum(duration) as duration, 
    strftime('%d-%m-%Y',timestamp) as date
    from times group by date, description order by date desc`).all();
    response.send(result);
});

// Post new data. 
app.post('/api', (request, response) => {
    console.log("'Saving' " + JSON.stringify(data));
    var stmt = db.prepare("INSERT INTO times (description, duration) VALUES (?, ?)");
    stmt.run(data.description, data.duration);
    response.send("OK");
});

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`Server is listening on ${port}`)
});