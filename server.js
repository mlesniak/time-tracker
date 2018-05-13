// npm install --save express
// npm install --save body-parser
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

app.use( bodyParser.json() );  
app.use(express.static('public'));

app.get('/api', (request, response) => {
    response.send('Hello from Express!')
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
    database.push(data);
    console.log(JSON.stringify(database));
}

// Contains all persisted data.
var database = [];