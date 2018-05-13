// npm install --save express
// npm install --save body-parser
// npm install --save sqlite3
const express = require('express')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data.sqlite3');
const app = express()
const port = 3000

app.use( bodyParser.json() );  
app.use(express.static('public'));

db.serialize(function() {
    db.run(`CREATE TABLE IF NOT EXISTS times (
        id          INTEGER PRIMARY KEY AUTOINCREMENT, 
        description TEXT,
        duration    INTEGER,
        timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP);`);
  
    // db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
    //     console.log(row.id + ": " + row.info);
    // });
  });
  

app.get('/api', (request, response) => {
    response.send(database);
});

// Post new data. 
app.post('/api', (request, response) => {
    save(request.body);
    response.send("OK");
});

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
});

function save(data) {
    data.timestamp = new Date();
    console.log("'Saving' " + JSON.stringify(data));
    
    var stmt = db.prepare("INSERT INTO times (description, duration, timestamp) VALUES (?, ?, ?)");
    stmt.run(data.description, data.duration, data.timestamp);
    stmt.finalize();
    
    database.push(data);
    console.log(JSON.stringify(database));
}

// Contains all persisted data.
var database = [];