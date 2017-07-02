import { Component, OnInit } from '@angular/core';
import { Photo } from './photo';
import { PhotoService } from './photo.service';
import * as _ from 'lodash';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [PhotoService]
})

export class AppComponent implements OnInit {
    title = 'Hello World @ Friday, April 14, 2017 14:24:00 GMT';
    photos: Photo[];
    orderReversed = true;
    sortPhotosClickHandler(): void {
        this.orderReversed = !this.orderReversed;
        this.sortPhotosByDate();
    }

    sortPhotosByDate(reversed: boolean = this.orderReversed): void {
        if (reversed) {
            this.photos = _.sortBy(this.photos, 'date').reverse();
        } else {
            this.photos = _.sortBy(this.photos, 'date');
        }
    }

    constructor(private photoService: PhotoService) { }

    getPhotos(): void {
        this.photoService.getPhotos().then(photos => {
            this.photos = photos;
            this.sortPhotosByDate();
        });
    }

    ngOnInit(): void {
        this.getPhotos();
    }
}
