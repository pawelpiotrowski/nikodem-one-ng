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
        GDrive.getFile({
            id: '0B-3a-sPk_VpNaWtFMzJXX2pRbEk',
            name: 'IMG_0442.JPG',
            createdTime: '2017-04-17T18:35:19.484Z',
            fileExtension: 'JPG'
        })
        .then(fileObj => {
            Log.success(['Super: ', [fileObj]]);
            Log.status(['App sync finished OK']);
            process.exit(0);
        })
        .catch(err => {
            Log.error(['Chujnia: ', [err]]);
            Log.status(['App sync failed ERROR']);
            process.exit(1);
        });
    }
}

if(process.argv[1] === __filename) {
    new AppSync(minimist(process.argv.slice(2))).init();
}
