import * as minimist from 'minimist';

import Log = require('./logger');
import Sync = require('./sync');
import Cleaner = require('./cleaner');
import GVision = require('./gvision');

export class AppSync {
    private config;

    constructor(args: object) {
        this.config = args;
    }

    async init(): Promise<void> {
        Log.status(['Start app sync with config', [this.config]]);
        if(this.config.token) {
            try {
                await Cleaner.removeGoogleToken();
            } catch(err) {
                Log.error(['Error removing google token: ', [err]]);
                throw err;
            }
        }
        Sync.start()
        //GVision.labelImages()
        .then(payload => {
            Log.success(['Sync done!!']);
            process.exit(0);
        })
        .catch(err => {
            Log.error(['Sync error: ', [err]]);
            process.exit(1);
        });
    }
}

if(process.argv[1] === __filename) {
    new AppSync(minimist(process.argv.slice(2))).init();
}
