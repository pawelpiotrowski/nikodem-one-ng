class Config {
    secretDir = __dirname + '/.secret/';
    tmpDir = __dirname + '/.tmpfiles/';
    filesTmpDir = this.tmpDir + 'files/';
    outputTmpDir = this.tmpDir + 'output/';
    clientIdFileName = 'client_id.json';
    clientTokenFileName = 'client_token.json';
    clientIdPath = this.secretDir + this.clientIdFileName;
    clientTokenPath = this.secretDir + this.clientTokenFileName;
    driveFolderToSync = 'Nikodem/web';
    remoteListUrl = 'http://nikodem.one/photos.json';
    localListFileName = 'files.json';
    localListFilePath = this.tmpDir + this.localListFileName;
    syncDiffFileName = 'diff.json';
    syncDiffFilePath = this.tmpDir + 'diff.json';
}

export = new Config();
