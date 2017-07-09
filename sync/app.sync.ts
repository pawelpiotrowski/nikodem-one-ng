import * as minimist from 'minimist';

import Log = require('./logger');
import Sync = require('./sync');

export class AppSync {
    private config: object;

    constructor(args: object) {
        this.config = args;
    }

    init(): void {
        Log.status(['Start app sync with config', [this.config]]);
        Sync.start()
        .then(remoteList => {
            Log.success(['cool']);
            process.exit(0);
        })
        .catch(err => {
            Log.error(['err', [err]]);
            process.exit(1);
        });
        // GDrive.getFile({
        //     id: '0B-3a-sPk_VpNdmdtdWRPQ01mRzg',
        //     name: 'IMG_0426.JPG',
        //     createdTime: '2017-04-17T18:35:31.317Z',
        //     fileExtension: 'JPG',
        //     size: '1587564'
        // })
        // .then(fileObj => {
        //     Log.success(['Super: ', [fileObj]]);
        //     Log.status(['App sync finished OK']);
        //     process.exit(0);
        // })
        // .catch(err => {
        //     Log.error(['Chujnia: ', [err]]);
        //     Log.status(['App sync failed ERROR']);
        //     process.exit(1);
        // });
    }
}

if(process.argv[1] === __filename) {
    new AppSync(minimist(process.argv.slice(2))).init();
}
