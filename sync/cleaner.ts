import fs = require('fs-extra');
import path = require('path');

import Config = require('./config');
import Log = require('./logger');

class Cleaner {
    async run(): Promise<void> {
        try {
            await fs.emptyDir(Config.filesTmpDir);
            await fs.emptyDir(Config.outputTmpDir);
            const diffFile = path.parse(Config.syncDiffFilePath).name;
            const diffExt = path.parse(Config.syncDiffFilePath).ext;
            const dateString = new Date().toISOString().replace(/\..+/,'').replace(/:/g,'-');
            await fs.rename(Config.syncDiffFilePath, Config.tmpDir + diffFile + '-' + dateString + diffExt);
        } catch(err) {
            throw err;
        }
    }
}

export = new Cleaner();
