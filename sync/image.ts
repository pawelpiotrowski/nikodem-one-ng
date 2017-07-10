import fs = require('fs-extra');
import klaw = require('klaw');
import path = require('path');
import Config = require('./config');
import Log = require('./logger');

const Jimp = require('jimp');

type PromiseSequence = Promise<any>;

class Image {

    processFile(filePath): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.ensureDir(Config.outputTmpDir)
            .then(() => {
                let outputPath = Config.outputTmpDir + path.parse(filePath).base;
                Jimp.read(filePath)
                .then(file => {
                    file.resize(1200, Jimp.AUTO)
                    .exifRotate()
                    .write(outputPath, () => {
                        Log.info(['Image processed: ', [outputPath]]);
                        resolve();
                    });
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    }

    processFiles(filesArr): Promise<any> {
        /*
        execute promises in sequence
        https://stackoverflow.com/questions/24586110/resolve-promises-one-after-another-i-e-in-sequence
        */
        let sequence: PromiseSequence = Promise.resolve();
        filesArr.forEach(fileObj => {
            sequence = sequence.then(() => {
                return this.processFile(fileObj);
            });
        });
        return sequence;
    }

    getInputFiles(): Promise<any> {
        return new Promise((resolve, reject) => {
            let inputFiles = [];
            klaw(Config.filesTmpDir)
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
                reject(new Error('Image process no input files found'));
            })
            .on('error', function(err) {
                reject(err);
            });
        })
    }

    async process(): Promise<any> {
        Log.info(['Image processing...']);
        try {
            const input = await this.getInputFiles();
            await this.processFiles(input);
        } catch(err) {
            throw err;
        }
    }
}

export = new Image();
