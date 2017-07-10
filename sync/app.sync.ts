import * as minimist from 'minimist';

import Log = require('./logger');
import Sync = require('./sync');
import Cleaner = require('./cleaner');

export class AppSync {
    private config: object;

    constructor(args: object) {
        this.config = args;
    }

    init(): void {
        Log.status(['Start app sync with config', [this.config]]);
        Sync.start()
        .then(payload => {
            Log.ok(['Sync done, cleaning up...']);
            return Cleaner.run()
        })
        .then(() => {
            Log.success(['Sync finished, temporary files deleted']);
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
