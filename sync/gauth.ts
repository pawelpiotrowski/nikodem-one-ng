import fs = require('fs-extra');
import readline = require('readline');
import GoogleAuthLib = require('google-auth-library');

import Config = require('./config');
import Log = require('./logger');

class GoogleAuth {
    private authScopes = ['https://www.googleapis.com/auth/drive'];

    getClientIdFile(): Promise<any> {
        return fs.readFile(Config.clientIdPath, 'utf-8').then(JSON.parse);
    }

    getClientTokenFile(): Promise<any> {
        return fs.readFile(Config.clientTokenPath, 'utf-8').then(JSON.parse);
    }

    setClientToken(token: {}): Promise<any> {
        return new Promise((resolve,reject) => {
            fs.ensureFile(Config.clientTokenPath)
            .then(() => {
                fs.writeFile(Config.clientTokenPath, JSON.stringify(token))
                .then(() => resolve())
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    }

    getNewClientToken(Oauth2Client): Promise<any> {
        return new Promise((resolve, reject) => {
            let authUrl = Oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: this.authScopes
            });

            Log.alert(['Google Auth: authorize this app by visiting this url:', [authUrl]]);

            let rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            Log.alert(['Google Auth: enter the code from that page here']);

            rl.question(': ', (code) => {
                rl.close();
                Oauth2Client.getToken(code, (err, token) => {
                    if(err) {
                        Log.error(['GoogleAuth: Error while trying to retrieve access token']);
                        reject(err);
                        return;
                    }
                    this.setClientToken(token);
                    Oauth2Client.credentials = token;
                    resolve(Oauth2Client);
                });
            });
        });
    }
    // needs client id
    getOauth2(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getClientIdFile()
            .then(clientIdFile => {
                let clientId = clientIdFile.installed.client_id;
                let clientSecret = clientIdFile.installed.client_secret;
                let redirectUrl = clientIdFile.installed.redirect_uris[0];
                let auth = new GoogleAuthLib();
                resolve(new auth.OAuth2(clientId, clientSecret, redirectUrl));
            })
            .catch(err => reject(err));
        });
    }
    // needs Oauth2 and client token
    getOauth2Client(): Promise<any> {
        return new Promise((resolve, reject) => {
            Log.info(['Getting google auth client']);
            this.getOauth2()
            .then(Oauth2Client => {
                this.getClientTokenFile()
                .then(token => {
                    Oauth2Client.credentials = token;
                    resolve(Oauth2Client);
                })
                .catch(err => {
                    if(err.code !== 'ENOENT') {
                        reject(err);
                        return;
                    }
                    this.getNewClientToken(Oauth2Client)
                    .then(Oauth2ClientWithToken => resolve(Oauth2ClientWithToken))
                    .catch(err => reject(err));
                });
            })
            .catch(err => reject(err));
        });
    }
    // alias
    getAuth(): Promise<any> {
        return this.getOauth2Client();
    }
}

export = new GoogleAuth();
