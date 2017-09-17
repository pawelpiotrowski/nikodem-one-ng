class Config {
    secretDir = __dirname + '/.secret/';
    tmpDir = __dirname + '/.tmpfiles/';
    filesTmpDir = this.tmpDir + 'files/';
    outputTmpDir = this.tmpDir + 'output/';
    clientIdFileName = 'google_client_id.json';
    clientTokenFileName = 'google_client_token.json';
    clientJWTFileName = 'nikodem-one-6d5d94ea8140.json';
    clientJWTPath = this.secretDir + this.clientJWTFileName;
    clientIdPath = this.secretDir + this.clientIdFileName;
    clientTokenPath = this.secretDir + this.clientTokenFileName;
    googleProjectName = 'nikodem-one';
    driveFolderToSync = 'Nikodem/web';
    remoteListUrl = 'http://nikodem.one/photos.json';
    localListFileName = 'files.json';
    localListFilePath = this.tmpDir + this.localListFileName;
    syncDiffFileName = 'diff.json';
    syncDiffFilePath = this.tmpDir + 'diff.json';
    awsUserFileName = 'aws_creds.json';
    awsUserPath = this.secretDir + this.awsUserFileName;
    awsBucketName = 'nikodem.one';
    awsBucketPhotosDir = 'photos/';
    awsBucketDataFile = 'photos.json';

    testDir = this.tmpDir + 'test/';
    testFilesFile = 'files-test.json';
    testFiles = this.tmpDir + this.testFilesFile;
}

export = new Config();
