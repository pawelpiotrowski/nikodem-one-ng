import { Injectable } from '@angular/core';

import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import * as moment from 'moment';

import { Photo } from './photo';

@Injectable()
export class PhotoService {
    private photosUrl = 'http://nikodem.one/photos.json';
    private photosDir = 'http://nikodem.one/photos/';

    constructor(private http: Http) { }

    getPhotos(): Promise<Photo[]> {
        return this.http.get(this.photosUrl)
            .toPromise()
            .then(response => {
                return this.parsePhotoResponse(response.json());
            })
            .catch(this.handleError);
    }

    private parsePhotoMeta(photo) {
        if (!photo.imageMediaMetadata) {
            return photo.createdTime;
        }
        let metaTime = photo.imageMediaMetadata.time.split(' ');
        metaTime[0] = metaTime[0].replace(/:/g, '-');
        return metaTime.join('T');
    }

    private parsePhotoResponse(resp): Photo[] {
        const p = [];
        resp.forEach(photo => {
            let _p = {
                path: this.photosDir + photo.name,
                date: this.parsePhotoMeta(photo),
                label: null
            };
            _p.label = moment(_p.date).format('YYYY-MM-DD HH:mm');
            p.push(_p);
        });
        return p;
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}
