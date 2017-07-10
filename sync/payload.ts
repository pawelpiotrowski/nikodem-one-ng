import fs = require('fs-extra');

import Config = require('./config');
import Log = require('./logger');
import Gdrive = require('./gdrive');
import Image = require('./image');
import S3 = require('./s3');

class Payload {

    updateData(): Promise<any> {
        return S3.updateData();
    }

    async make(): Promise<any> {
        Log.info(['Making payload...']);
        let payload;
        try {
            const diff = await fs.readJSON(Config.syncDiffFilePath);
            if(diff.toAdd.length) {
                await Gdrive.getFiles(diff.toAdd);
                await Image.process();
                await S3.addInputFiles();
            }
            if(diff.toDelete.length) {
                await S3.removeFiles(diff.toDelete);
            }
            payload = diff.remote;
        } catch(err) {
            throw err;
        }
        return payload;
    }
}

export = new Payload();
