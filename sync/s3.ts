import fs = require('fs-extra');
import klaw = require('klaw');
import path = require('path');
import S3fs = require('s3fs');

//import AWS = require('aws-sdk');

//AWS.config.loadFromPath(Config.awsUserPath);

import Config = require('./config');
import Log = require('./logger');

class S3 {
    getCreds(): Promise<any> {
        return fs.readFile(Config.awsUserPath, 'utf-8').then(JSON.parse);
    }

    async getClient(): Promise<any> {
        let client;
        try {
            const creds = await this.getCreds();
            client = new S3fs(Config.awsBucketName, {
                accessKeyId: creds.accessKeyId,
                secretAccessKey: creds.secretAccessKey,
                endpoint: 's3-eu-central-1.amazonaws.com',
                signatureVersion: 'v4',
                region: creds.region
            });
        } catch(err) {
            throw err;
        }
        return client;
    }

    removeFiles(files): Promise<any> {
        return new Promise((resolve, reject) => {
            Log.info(['S3 removing files...',[files]]);
            resolve();
        })
    }

    getOutputFiles(): Promise<any> {
        return new Promise((resolve, reject) => {
            let outputFiles = [];
            klaw(Config.outputTmpDir)
            .on('data', function(item) {
                var fileExt = path.parse(item.path).ext.toLowerCase();
                if(fileExt === '.jpg' || fileExt === '.jpeg') {
                    outputFiles.push(item.path);
                }
            })
            .on('end', function() {
                if(outputFiles.length) {
                    return resolve(outputFiles);
                }
                reject(new Error('S3 no output files found'));
            })
            .on('error', function(err) {
                reject(err);
            });
        })
    }

    addImage(filePath: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getClient()
            .then(client => {
                let fileName = path.parse(filePath).base;
                Log.info(['S3 uploading: "' + fileName + '"']);
                let file = Config.awsBucketPhotosDir + fileName;
                let stream = fs.createReadStream(filePath);
                client.writeFile(file, stream, { ContentType: 'image/jpeg' }, (err, e) => {
                    if(err) {
                        return reject(err);
                    }
                    Log.ok(['S3 uploaded: "' + file + '"']);
                    resolve();
                });
            })
            .catch(err => {
                reject(err)
            });
        });
    }

    addImages(filesArr): Promise<any> {
        /*
        execute promises in sequence
        https://stackoverflow.com/questions/24586110/resolve-promises-one-after-another-i-e-in-sequence
        */
        let sequence = Promise.resolve();
        filesArr.forEach(file => {
            sequence = sequence
            .then(() => {
                return this.addImage(file);
            })
            .catch(err => {
                Promise.reject(err);
                throw err;
            });
        });
        return sequence;
    }

    updateData(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getClient()
            .then(client => {
                Log.info(['S3 updating data...']);
                let stream = fs.createReadStream(Config.localListFilePath);
                client.writeFile(Config.awsBucketDataFile, stream, { ContentType: 'application/json' },
                (err, e) => {
                    if(err) {
                        return reject(err);
                    }
                    Log.ok(['S3 data updated!']);
                    resolve();
                });
            })
            .catch(err => {
                reject(err)
            });
        });
    }

    addInputFiles(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getOutputFiles()
            .then(outputFiles => {
                return this.addImages(outputFiles);
            })
            .then(() => resolve())
            .catch(err => reject(err));
        });
    }
}

export = new S3();
