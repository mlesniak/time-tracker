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

db.exec(`CREATE TABLE IF NOT EXISTS times (
    id          INTEGER PRIMARY KEY AUTOINCREMENT, 
    description TEXT,
    duration    INTEGER,
    timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP);`);
    
    // select description, sum(duration), strftime('%d-%m-%Y',timestamp/1000,'unixepoch') as d from times gro description;
    
    
    app.get('/api', (request, response) => {
        // var result = undefined;
        // var ret = db.all(`select description, sum(duration) as duration, strftime('%d-%m-%Y',timestamp/1000,'unixepoch') as date
        // from times group by date, description order by date desc`, function(data) {
        //     result = data;
        // });
        // while (result == undefined) {
        //     // Do nothing;
        // }
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
        console.log("'Saving' " + JSON.stringify(data));
        var stmt = db.prepare("INSERT INTO times (description, duration) VALUES (?, ?)");
        stmt.run(data.description, data.duration);
    }
    
    // Contains all persisted data.
    var database = [];