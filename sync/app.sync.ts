import * as minimist from 'minimist';
import Log = require('./logger');
import GDrive = require('./gdrive');

export class AppSync {
    private config: object;
    constructor(args: object) {
        this.config = args;
    }
    init(): void {
        Log.status(['Start app sync with config', [this.config]]);
        GDrive.getFolderToSyncContent()
        .then(folder => {
            Log.success(['Get google drive folder to sync content: ', [folder]]);
            Log.status(['App sync finished OK']);
            process.exit(0);
        })
        .catch(err => {
            Log.error(['Get google drive folder to sync content: ', [err]]);
            Log.status(['App sync failed ERROR']);
            process.exit(1);
        });
    }
}

if(process.argv[1] === __filename) {
    new AppSync(minimist(process.argv.slice(2))).init();
}
