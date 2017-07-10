import * as minimist from 'minimist';

import Log = require('./logger');
import Sync = require('./sync');
import Cleaner = require('./cleaner');
import Payload = require('./payload');

export class AppSync {
    private config: object;

    constructor(args: object) {
        this.config = args;
    }

    init(): void {
        Log.status(['Start app sync with config', [this.config]]);
        Sync.start()
        .then(payload => {
            Log.success(['cool', [payload]]);
            process.exit(0);
        })
        .catch(err => {
            Log.error(['err', [err]]);
            process.exit(1);
        });
    }
}

if(process.argv[1] === __filename) {
    new AppSync(minimist(process.argv.slice(2))).init();
}
