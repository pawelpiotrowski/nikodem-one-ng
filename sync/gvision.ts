import _ = require('lodash');
import fs = require('fs-extra');
import klaw = require('klaw');
import path = require('path');
import Config = require('./config');
import Log = require('./logger');

const Vision = require('@google-cloud/vision')({
    projectId: Config.googleProjectName,
    keyFilename: Config.clientJWTPath
});

type PromiseSequence = Promise<any>;

class GVision {
    dataFile = require(Config.testFiles);

    getImageLabels(filePath: string): Promise<any> {
        return new Promise((resolve, reject) => {
            //console.log(this.dataFile);
            Log.info(['Labeling image:',[filePath]]);
            let imgInd = _.findIndex(this.dataFile, { name: path.parse(filePath).base });
            Vision.detectLabels(filePath)
            .then(result => {
                this.dataFile[imgInd].tags = result[0];
                Log.ok(['Labeled',[result[0]]]);
                resolve();
            })
            .catch(err => reject(err));
        });
    }

    getImagesLabels(filesArr): Promise<any> {
        /*
        execute promises in sequence
        https://stackoverflow.com/questions/24586110/resolve-promises-one-after-another-i-e-in-sequence
        */
        let sequence: PromiseSequence = Promise.resolve();
        filesArr.forEach(filePath => {
            sequence = sequence.then(() => {
                return this.getImageLabels(filePath);
            });
        });
        return sequence;
    }

    getInputFiles(): Promise<any> {
        return new Promise((resolve, reject) => {
            let inputFiles = [];
            klaw(Config.testDir)
            .on('data', function(item) {
                var fileExt = path.parse(item.path).ext.toLowerCase();
                if(fileExt === '.jpg' || fileExt === '.jpeg') {
                    inputFiles.push(item.path);
                }
            })
            .on('end', function() {
                if(inputFiles.length) {
                    return resolve(inputFiles);
                }
                reject(new Error('Label images no input files found'));
            })
            .on('error', function(err) {
                reject(err);
            });
        })
    }

    async labelImages(): Promise<any> {
        Log.info(['Labeling images...']);
        try {
            const inputFiles = await this.getInputFiles();
            await this.getImagesLabels(inputFiles);
            await fs.outputJson(Config.testFiles, this.dataFile);
        } catch(err) {
            throw err;
        }
    }
}

export = new GVision();
