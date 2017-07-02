import * as minimist from 'minimist';

export class AppSync {
    init(args: object): void {
        console.log('Start app sync with arguments ', args);
    }
}

if(process.argv[1] === __filename) {
    new AppSync().init(minimist(process.argv.slice(2)));
}
