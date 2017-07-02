import { NikodemOneNgPage } from './app.po';

describe('nikodem-one-ng App', () => {
    let page: NikodemOneNgPage;

    beforeEach(() => {
        page = new NikodemOneNgPage();
    });

    it('should display welcome message', () => {
        page.navigateTo();
        expect(page.getParagraphText()).toEqual('Welcome to app!!');
    });
});
