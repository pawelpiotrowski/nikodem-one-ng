import { AppSync } from './app.sync';
import { expect } from 'chai';

describe('AppSync', () => {
    it('should create the app with property "init"', () => {
        expect(new AppSync({})).to.have.property('init');
    });
});
