//create a server to listen on port 3000  it accepts a request and sends a response
const http = require('http');
const fs = require('fs');
const path = require('path');
const hostname = 'localhost';
const port = 3001;
const express = require('express');
const bodyParser = require('body-parser');



const app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//disable the cache
app.disable('etag');
//Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});


app.use((req, res) => {
    let response = {
        status: 'failure',
        message: 'Invalid Route'
    };
    let fileName = req.url.split('/')[1];
    if (fileName) {
        fs.readFile(path.join(__dirname + '/' + fileName), (err, data) => {
            if (err) {
                res.statusCode = 404;
                response.status = 'failure';
                response.message = 'Error::' + err.message;
                res.send(response);
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(data);
            }
        });
    }
    else {
        res.statusCode = 404;
        response.status = 'failure';
        response.message = 'Error::Invalid Route';
        res.send(response);
    }
});

// app.use((req, res) => {
//     let response = {
//         status: 'success',
//         message: 'Invalid Route'+req.url
//     };
//     res.statusCode = 200;
//     res.send(response);
// });

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});