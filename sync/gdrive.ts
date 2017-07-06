import fs = require('fs-extra');
import Gauth = require('./gauth');
import Log = require('./logger');
import googleApi = require('googleapis');

type PromiseSequence = Promise<any>;

class GoogleDrive {
    private filesTmpDir = __dirname + '/.tmpfiles/';
    private folderToSync = 'Nikodem/web';

    private folderMimeType = 'mimeType="application/vnd.google-apps.folder"';
    private imageMimeType = 'mimeType contains "image/"';

    private folderContentFields = 'nextPageToken, files(id, name, fileExtension, size, createdTime,  imageMediaMetadata(time))';
    private folderIdFields = 'nextPageToken, files(id, name)';

    private folderIdPayloadSize = 10;
    private folderContentPayloadSize = 100;

    drive = googleApi.drive('v3');

    getFolderIdByName(name: string, parentId?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            Log.info(['Getting drive folder id for name: "' + name + '"']);
            Gauth.getAuth()
            .then(auth => {
                let query = this.folderMimeType + ' and name = "' + name + '"';
                if(parentId) {
                    query += ' and "' + parentId + '" in parents';
                }
                this.drive.files.list({
                    auth: auth,
                    q: query,
                    pageSize: this.folderIdPayloadSize,
                    fields: this.folderIdFields
                }, (err, response) => {
                    if(err || !response.files.length) {
                        reject({ error: 'Error getting folder id by name for "' + name + '"' });
                        return;
                    }
                    resolve(response.files[0]);
                });
            })
            .catch(err => reject(err));
        });
    }

    getFolderContentById(folderId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            Log.info(['Getting drive folder content for id: "' + folderId + '"']);
            Gauth.getAuth()
            .then(auth => {
                this.drive.files.list({
                    auth: auth,
                    q: this.imageMimeType + ' and "' + folderId + '" in parents',
                    pageSize: this.folderContentPayloadSize,
                    fields: this.folderContentFields
                }, (err, response) => {
                    if(err || !response.files.length) {
                        reject({ error: 'Error getting drive folder content bt id "' + folderId + '"' });
                        return;
                    }
                    response.files.forEach(file => {
                        file.name = file.name.replace(/ /g, '_');
                    });
                    resolve(response.files);
                })
            })
            .catch(err => reject(err));
        });
    }

    folderWalker(parentId: string, folders: string[]): Promise<any> {
        /*
        execute promises in sequence
        https://stackoverflow.com/questions/24586110/resolve-promises-one-after-another-i-e-in-sequence
        */
        let sequence: PromiseSequence = Promise.resolve();
        folders.forEach(folderName => {
            sequence = sequence.then(returned => {
                let previousId = (returned) ? returned.id : parentId;
                return this.getFolderIdByName(folderName, previousId);
            });
        });
        return sequence;
    }

    getFolderToSyncId(): Promise<any> {
        return new Promise((resolve, reject) => {
            let splitFolderPath = this.folderToSync.split('/');
            this.getFolderIdByName(splitFolderPath[0])
            .then(folder => {
                if(splitFolderPath.length === 1) {
                    resolve(folder);
                    return;
                }
                this.folderWalker(folder.id, splitFolderPath.slice(1))
                .then(lastFolder => resolve(lastFolder))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    }

    getFolderToSyncContent(): Promise<any> {
        return new Promise((resolve, reject) => {
            Log.info(['Getting drive folder content to sync']);
            this.getFolderToSyncId()
            .then(folderToSync => {
                this.getFolderContentById(folderToSync.id)
                .then(folderContent => resolve(folderContent))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    }

    getFile(fileObj): Promise<any> {
        return new Promise((resolve, reject) => {
            Log.info(['Downloading file -> ' + fileObj.name]);
            fs.ensureDir(this.filesTmpDir)
            .then(() => { return Gauth.getAuth(); })
            .then(auth => {
                let path = this.filesTmpDir + fileObj.name;
                let dest = fs.createWriteStream(path);
                this.drive.files.get({
                    auth: auth,
                    fileId: fileObj.id,
                    alt: 'media'
                })
                .on('end', (e) => {
                    Log.info(['Get file end, checking file -> ' + fileObj.name]);
                    let file = { file: fileObj, path: path };
                    if(dest.bytesWritten > fileObj.size * 0.8) {
                        Log.ok(['File downloaded: ',[path]]);
                        resolve(file);
                        return;
                    }
                    Log.warning(['File downloaded with errors: ',[path]]);
                    reject(file);
                })
                .on('error', (err) => {
                    Log.warning(['File download error: ',[path]]);
                    reject(err);
                })
                .pipe(dest);
            })
            .catch(err => reject(err));
        });
    }

    getFiles(filesArr): Promise<any> {
        return new Promise((resolve, reject) => {
            /*
            execute promises in sequence
            https://stackoverflow.com/questions/24586110/resolve-promises-one-after-another-i-e-in-sequence
            */
            let sequence: PromiseSequence = Promise.resolve();
            filesArr.forEach(fileObj => {
                sequence = sequence.then(() => {
                    return this.getFile(fileObj);
                });
            });
            return sequence;
        });
    }
}

export = new GoogleDrive();
