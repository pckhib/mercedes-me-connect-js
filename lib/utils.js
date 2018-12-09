const SwaggerClient = require('swagger-client');
const request = require('request');
const opn = require('opn');
const express = require('express');
const fs = require('fs');

const baseUrl = 'https://api.secure.mercedes-benz.com/';
const apiUrl = __dirname + '\\swagger_experimental_connected_vehicle_api_3.json';

async function authorize(clientId, clientSecret) {
    let authCode = await getAuthorizationCode(clientId);
    let tokens = await getTokens(clientId, clientSecret, authCode);
    return tokens;
}


function getClient(accessToken) {
    return new Promise((resolve, reject) => {
        SwaggerClient({
            spec: JSON.parse(fs.readFileSync(apiUrl, 'utf8')),
            requestInterceptor: req => {
                req.headers['accept'] = 'application/json',
                req.headers['authorization'] = 'Bearer ' + accessToken
            }
        })
        .then(client => {
            resolve(client);
        });
    });
}

/**
 * Private functions
 */

function getAuthorizationCode(clientId) {
    return new Promise((resolve, reject) => {
        const app = express();
        app.get('/mercedeso2c', (req, res) => {
            res.send('Authorization complete. You can now close this window.');
            server.close();

            resolve(req.query.code);
        });
        const server = app.listen(3000);
        const scope = 'mb:vehicle:status:general%20mb:user:pool:reader';
        let url = baseUrl + 'oidc10/auth/oauth/v2/authorize';
        opn(url + '?client_id=' + clientId + '&response_type=code&scope=' + scope + '&redirect_uri=http://localhost:3000/mercedeso2c');
    });
}

function getTokens(clientId, clientSecret, authCode) {
    return new Promise((resolve, reject) => {
        const encodedClientId = Buffer.from(clientId + ':' + clientSecret).toString('base64');
        request.post({
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'authorization': 'Basic ' + encodedClientId
            },
            url: baseUrl + 'oidc10/auth/oauth/v2/token',
            body: 'grant_type=authorization_code&code=' + authCode + '&redirect_uri=http://localhost:3000/mercedeso2c'
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const json = JSON.parse(body);
                resolve({
                    access_token: json.access_token,
                    refresh_token: json.refresh_token,
                    expires_in: json.expires_in,
                    timestamp: Date.now()
                });
            } else {
                reject(error);
            }
        });
    });
}


module.exports = {
    authorize,
    getClient
};