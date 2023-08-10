(function () {
    let serverConfig = {
        // server: 'http://16.16.215.255:3000',
        server: './',
        routes: {
            getConfig: '/getConfig',
            setConfig: '/setConfig',
            createConfig: '/createConfig',
            getConfigList: '/getConfigList'
        }
    }
    function render() {
        getConfigList(function (responseObj) {
            if (responseObj.status !== 'success') {
                alert("getConfigList :: " + responseObj.message);
                return;
            }
            let configListObj = responseObj.data;
            if (!configListObj) {
                configListObj = ["samsung.json", "samsung2.json", "lg.json"];
            }
            renderConfigList(configListObj);
        });
    }

    function renderConfigList(configList) {
        let configListElement = document.getElementById('configList');
        configListElement.innerHTML = '';
        configList.forEach(function (configName) {
            let configElement = document.createElement('div');
            configElement.innerHTML = configName;
            configElement.addEventListener('click', function () {
                getConfig(configName, function (config) {
                    let configObj = {};
                    if (typeof config == 'string') {
                        configObj = JSON.parse(config);
                    } else {
                         configObj = config;
                    }    
                    if (configObj.status !== 'success') {
                        alert("getConfig :: " + configObj.message);
                        return;
                    }
                    let configJson = configObj.data;
                    if (!configJson) {
                        configJson = {
                            "name": "lg.json",
                            "version": "1.0.0",
                            "description": "LG TV Themes",
                            "config": {
                                "loginTheme": "test_THEME_005",
                                "homeTheme": "THEME_006",
                                "detailsTheme": "THEME_007",
                                "playerTheme": "THEME_008"
                            }
                        }
                    }
                    renderEachConfig(configJson);
                    renderFooter(configJson);
                });
            });
            configListElement.appendChild(configElement);
        });
        let buttonElement = document.createElement('button');
        buttonElement.innerHTML = 'Create New Config';
        buttonElement.addEventListener('click', function () {
            createNewConfig();
        });
        configListElement.appendChild(buttonElement);
    }
    function renderEachConfig(configJson) {
        let configElementParent = document.getElementById('configElement');
        configElementParent.innerHTML = '';
        for (let key in configJson) {
            let configItemElement = document.createElement('div');
            configItemElement.setAttribute('class', 'eachConfigItem');
            let keyDiv = document.createElement('div');
            keyDiv.setAttribute('class', 'configKey');
            let valueDiv = document.createElement('div');
            valueDiv.setAttribute('class', 'configValue');
            keyDiv.innerHTML = key;
            configItemElement.appendChild(keyDiv);
            configItemElement.appendChild(valueDiv);
            configElementParent.appendChild(configItemElement);
            if (key != 'config') {
                let inputElement = document.createElement('input');
                inputElement.setAttribute('type', 'text');
                inputElement.setAttribute('value', configJson[key]);
                inputElement.setAttribute('disabled', 'disabled');
                inputElement.setAttribute("data-key", key);
                valueDiv.appendChild(inputElement);
            }
            if (key == 'config') {
                for (let configKey in configJson[key]) {
                    let configItemElement2 = document.createElement('div');
                    configItemElement2.setAttribute('class', 'eachConfigItem');
                    let keyDiv2 = document.createElement('div');
                    keyDiv2.setAttribute('class', 'configKey');
                    let valueDiv2 = document.createElement('div');
                    valueDiv2.setAttribute('class', 'configValue');
                    keyDiv2.innerHTML = configKey;
                    let inputElement = document.createElement('input');
                    inputElement.setAttribute('type', 'text');
                    inputElement.setAttribute('value', configJson[key][configKey]);
                    inputElement.setAttribute("data-key", configKey);
                    //disable editing
                    inputElement.setAttribute('disabled', 'disabled');
                    valueDiv2.appendChild(inputElement);
                    configItemElement2.appendChild(keyDiv2);
                    configItemElement2.appendChild(valueDiv2);
                    configElementParent.appendChild(configItemElement2);
                }
            }
        }
    }

    function renderFooter(configJson, options = {}) {
        let footerElement = document.getElementById('rightMenuFooter');
        footerElement.innerHTML = '';
        let editButton = document.createElement('button');
        editButton.innerHTML = 'Edit Config';
        editButton.addEventListener('click', enableEditing);

        let saveButton = document.createElement('button');
        if (options.createMode) {
            saveButton.innerHTML = 'Create Config';
        } else {
            saveButton.innerHTML = 'Save Config';
        }
        saveButton.addEventListener('click', saveConfig.bind(null, configJson,options));       

        let cancelButton = document.createElement('button');
        cancelButton.innerHTML = 'Cancel';
        cancelButton.addEventListener('click', render);

        footerElement.appendChild(editButton);
        footerElement.appendChild(saveButton);
        footerElement.appendChild(cancelButton);

    }


    function enableEditing() {
        let configElementParent = document.getElementById('configElement');
        let inputElements = configElementParent.getElementsByTagName('input');
        for (let i = 0; i < inputElements.length; i++) {
            inputElements[i].removeAttribute('disabled');
        }
    }

    function saveConfig(configJson, options = {}) {
        let configElementParent = document.getElementById('configElement');
        let inputElements = configElementParent.getElementsByTagName('input');
        for (let key in configJson) {
            if (typeof configJson[key] == 'object') {
                for (let configKey in configJson[key]) {
                    let newValue = getInputValueWithKey(configKey);                    
                    if (newValue && newValue !== configJson[key][configKey]) {
                        configJson[key][configKey] = newValue;
                    }
                }
            } else {
                let newValue = getInputValueWithKey(key);  
                if (newValue && newValue !== configJson[key]) {
                    configJson[key] = newValue;
                }
            }
        }

        if (options.createMode) {
            createConfig(configJson.name, configJson, function (response) {
                alert("Data Saved");
                console.log(response);
                render();
            });
        } else {
            setConfig(configJson.name, configJson, function (response) {
                alert("Data Saved");
                console.log(response);
                render();
            });
        }


        function getInputValueWithKey(keyName) {
            for(let i=0;i<inputElements.length;i++){
                if(inputElements[i].getAttribute('data-key') == keyName){
                    return inputElements[i].value;
                }
            }
            return "";
        }
        

    }


    function getConfigList(callback) {
        let url = serverConfig.server + serverConfig.routes.getConfigList;
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let responseObj = {};
                try {
                    responseObj = JSON.parse(xhr.responseText);
                } catch (error) {
                    responseObj.status = 'failure';
                    responseObj.message = 'Error::' + error.message;
                }
                callback(responseObj);
            }
        }
        xhr.send();
    }

    function createNewConfig() {
        let dummyConfig = {
            "name": "NAME HERE",
            "version": "1.0.0",
            "description": "LG TV Themes",
            "config": {
                "loginTheme": "THEME_005",
                "homeTheme": "THEME_006",
                "detailsTheme": "THEME_007",
                "playerTheme": "THEME_008"
            }
        };
        renderEachConfig(dummyConfig);
        renderFooter(dummyConfig, { createMode: true });
    }

    function getConfig(configName, callback) {
        let url = serverConfig.server + serverConfig.routes.getConfig + '?configName=' + configName;
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let responseObj = {};
                try {
                    responseObj = JSON.parse(xhr.responseText);
                } catch (error) {
                    responseObj.status = 'failure';
                    responseObj.message = 'Error::' + error.message;
                }
                callback(responseObj);
            }
        }
        xhr.send();
    }


    function setConfig(configName, jsonConfig, callback) {
        let url = serverConfig.server + serverConfig.routes.setConfig;
        let xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let responseObj = {};
                try {
                    responseObj = JSON.parse(xhr.responseText);
                } catch (error) {
                    responseObj.status = 'failure';
                    responseObj.message = 'Error::' + error.message;
                }
                callback(responseObj);
            }
        }
        let data = JSON.stringify({ configName: configName, jsonConfig: jsonConfig });
        xhr.send(data);
    }

    function createConfig(configName, jsonConfig, callback) {
        let url = serverConfig.server + serverConfig.routes.createConfig;
        let xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let responseObj = {};
                try {
                    responseObj = JSON.parse(xhr.responseText);
                } catch (error) {
                    responseObj.status = 'failure';
                    responseObj.message = 'Error::' + error.message;
                }
                callback(responseObj);
            }
        }
        let data = JSON.stringify({ configName: configName, jsonConfig: jsonConfig });
        xhr.send(data);
    }
    function init() {
        if (document.body) {
            render();
        } else {
            document.addEventListener('DOMContentLoaded', render);
        }
    }
    init();
    return {

    }
})();
