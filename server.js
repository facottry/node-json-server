//create a server to listen on port 3000  it accepts a request and sends a response
const http = require('http');
const fs = require('fs');
const path = require('path');
const hostname = 'localhost';
const port = 3000;
//create a server on express
const express = require('express');
const bodyParser = require('body-parser');
const e = require('express');
const routes = {
    getConfig: '/getConfig',
    setConfig: '/setConfig',
    getConfigList: '/getConfigList'
}
const app = express();

app.use(express.static(__dirname + '/public'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});



app.get('/getConfigList', (req, res) => {
    let response = {
        status: 'failure',
        message: 'Unknown Error'
    };
    try {
        fs.readdir(path.join(__dirname + '/config'), (err, files) => {
            if (err) {
                response.status = 'failure';
                response.message = '1_Error::' + err.message;
                res.send(response);
            }
            else {
                response.status = 'success';
                response.message = 'config file list';
                response.data = files;
                res.send(response);
            }
        });
    } catch (error) {
        response.status = 'failure';
        response.message = '2_Error::' + error.message;
        res.send(response);
    }
});

app.get('/getConfig', (req, res) => {
    let response = {
        status: 'failure',
        message: 'Unknown Error'
    };
    let configName = req.query.configName;
    try {
        fs.readFile(path.join(__dirname + '/config/' + configName), (err, data) => {
            if (err) {
                response.status = 'failure';
                response.message = '1_Error::' + err.message;
                res.send(response);
            }
            else {
                response.status = 'success';
                response.message = 'config file read successfully';
                let dataStr = data.toString();  
                let dataJson = {};
                try {
                    dataJson = JSON.parse(dataStr);
                } catch (error) {
                    dataJson = {
                        error: error.message
                    };
                }
                response.data = dataJson;
                response.dataStr = dataStr;
                res.send(response);
            }
        });
    } catch (error) {
        response.status = 'failure';
        response.message = '2_Error::' + error.message;
        res.send(response);
    }

});

app.post('/setConfig', (req, res) => {
    console.log('setConfig - req.body', req.body);
    let configName = req.body.configName;
    let jsonConfig = req.body.jsonConfig;
    console.log('setConfig - configName', configName);
    console.log('setConfig - jsonConfig', jsonConfig);
    let response = {
        status: 'failure',
        message: 'Unknown Error'
    };
    try {
        let configPath = path.join(__dirname + '/config/' + configName);
        let jsonConfigStr = JSON.stringify(jsonConfig);
        fs.writeFile(configPath, jsonConfigStr, (err) => {
            if (err) {
                response.status = 'failure';
                response.message = '1_Error::' + err.message;
                res.send(response);
            }
            else {
                response.status = 'success';
                response.message = 'Config Saved';
                res.send(response);
            }
        });
    } catch (error) {
        response.status = 'failure';
        response.message = '2_Error::' + error.message;
        res.send(response);
    }

});

app.post('/createConfig', (req, res) => {
    let configName = req.body.configName;
    let jsonConfig = req.body.jsonConfig;
    let response = {
        status: 'failure',
        message: 'Unknown Error'
    };
    let jsonConfigStr = JSON.stringify(jsonConfig);
    try {
        fs.writeFile(path.join(__dirname + '/config/' + configName), jsonConfigStr, (err) => {
            if (err) {
                response.status = 'failure';
                response.message = '1_Error::' + err.message;
            }
            else {
                response.status = 'success';
                response.message = 'Config Created';
            }
            res.send(response);
        });
    } catch (error) {
        response.status = 'failure';
        response.message = '2_Error::' + error.message;
        res.send(response);
    }
    
});

//default route
app.use((req, res) => {
    let response = {
        status: 'success',
        message: 'Invalid Route'
    };
    res.statusCode = 200;
    res.send(response);
});

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});