import { TestBed, inject } from '@angular/core/testing';

import { Http, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { PhotoService } from './photo.service';

describe('PhotoService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MockBackend,
                BaseRequestOptions,
                {
                    provide: Http,
                    useFactory: (backendInstance: MockBackend, defaultOptions: BaseRequestOptions) => {
                        return new Http(backendInstance, defaultOptions);
                    },
                    deps: [
                        MockBackend,
                        BaseRequestOptions
                    ]
                },
                PhotoService
            ]
        });
    });

    it('should be created', inject([PhotoService], (service: PhotoService) => {
        expect(service).toBeTruthy();
    }));
});
