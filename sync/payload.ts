import fs = require('fs-extra');

import Config = require('./config');
import Log = require('./logger');
import Gdrive = require('./gdrive');
import Image = require('./image');

class Payload {

    updateLocalList(list): Promise<any> {
        return fs.outputJSON(Config.localListFilePath, list);
    }

    removeFiles(files): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve();
        })
    }

    async make(): Promise<any> {
        Log.info(['Making payload...']);
        try {
            const diff = await fs.readJSON(Config.syncDiffFilePath);
            if(diff.toAdd.length) {
                await Gdrive.getFiles(diff.toAdd);
                await Image.process();
            }
            if(diff.toDelete.length) {
                await this.removeFiles(diff.toAdd);
            }
            await this.updateLocalList(diff.remote);
        } catch(err) {
            throw err;
        }
    }
}

export = new Payload();
