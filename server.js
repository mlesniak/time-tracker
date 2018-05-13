// Install with npm install express --save
const express = require('express')
const app = express()
const port = 3000

app.get('/api', (request, response) => {
    response.send('Hello from Express!')
});

app.use(express.static('public'));

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
});