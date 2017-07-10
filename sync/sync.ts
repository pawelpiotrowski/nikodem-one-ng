import _ = require('lodash');
import fs = require('fs-extra');
import request = require('request');

import Cleaner = require('./cleaner');
import Config = require('./config');
import Log = require('./logger');
import Gdrive = require('./gdrive');
import Payload = require('./payload');

class Sync {

    setLocalList(listContent: any[]): Promise<any> {
        return fs.outputJson(Config.localListFilePath, listContent).then(() => {
            return listContent;
        });
    }

    setDiff(diff: {}): Promise<any> {
        return fs.outputJson(Config.syncDiffFilePath, diff);
    }

    getRemoteList(): Promise<any> {
        return new Promise((resolve, reject) => {
            request(Config.remoteListUrl, (err, resp, body) => {
                if(err || resp.statusCode !== 200) {
                    return reject(new Error('Request Failed. Status Code: ' + resp.statusCode));
                }
                resolve(JSON.parse(body));
            })
        });
    }

    async getLocalList(): Promise<any> {
        let localList: {};
        try {
            localList = await fs.readJSON(Config.localListFilePath);
        } catch(err) {
            if(err.code === 'ENOENT') {
                const remoteList = await this.getRemoteList();
                const localList = await this.setLocalList(remoteList);
                return localList;
            }
            throw err;
        }
        return localList;
    }

    async calculateDiff(): Promise<any> {
        let diff = { remote: [], local: [], toAdd: [], toDelete: [] };
        try {
            diff.local = await this.getLocalList();
            diff.remote = await Gdrive.getFolderToSyncContent();
            diff.local.forEach(item => {
                let existInRemote = _.find(diff.remote, { id: item.id });
                if(!existInRemote) {
                    diff.toDelete.push(item);
                }
            });
            diff.remote.forEach(item => {
                let existInLocal = _.find(diff.local, { id: item.id });
                if(!existInLocal) {
                    diff.toAdd.push(item);
                }
            });
        } catch(err) {
            throw err;
        }
        return diff;
    }

    async getDiff(): Promise<any> {
        Log.info(['Getting diff to sync']);
        let diffResult = { diff: false, diffMsg: 'nothing to sync.' };
        try {
            const diff = await this.calculateDiff();
            if(diff.toAdd.length || diff.toDelete.length) {
                await this.setDiff(diff);
                diffResult.diff = true;
                diffResult.diffMsg = diff.toAdd.length +
                    ` items to add and ` + diff.toDelete.length + ` to delete.`;
            }
        } catch(err) {
            throw err;
        }
        Log.ok(['Sync diff: there is ' + diffResult.diffMsg]);
        return diffResult;
    }

    async start(): Promise<void> {
        try {
            let diffResult = await this.getDiff();
            if(diffResult.diff) {
                let payload = await Payload.make();
                await this.setLocalList(payload);
                await Payload.updateData();
                await Cleaner.run();
            }
        } catch(err) {
            throw err;
        }
    }
}

export = new Sync();
