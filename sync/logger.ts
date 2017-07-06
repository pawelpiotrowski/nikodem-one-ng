import * as chalk from 'chalk';

interface LogMsg {
    0: string;
    1?: [any]
}

class Logger {
    private logInLoop(messages: [any]): void {
        if(messages && messages.length) {
            messages.forEach(msg => console.log(msg));
        }
        console.log(chalk.dim('\n----\n'));
    }
    alert(msg: LogMsg): void {
        console.log('_(``o)_/  ', chalk.magenta(msg[0]));
        this.logInLoop(msg[1]);
    }
    status(msg: LogMsg): void {
        console.log('|_(``.)_  ' , chalk.cyan('Status: ' + msg[0]), '\n');
        this.logInLoop(msg[1]);
    }
    info(msg: LogMsg): void {
        console.log('(``.)  ', chalk.grey('Info: ' + msg[0]), '\n');
        this.logInLoop(msg[1]);
    }
    ok(msg: LogMsg): void {
        console.log('(``-)_,  ', chalk.green('\u2714 OK: '), chalk.grey(msg[0]), '\n');
        this.logInLoop(msg[1]);
    }
    success(msg: LogMsg): void {
        console.log('\\_(``*)_/  ', chalk.green('Success: ' + msg[0]), '\n');
        this.logInLoop(msg[1]);
    }
    warning(msg: LogMsg): void {
        console.log('_(``~)_  ', chalk.yellow('Warning: ' + msg[0]), '\n');
        this.logInLoop(msg[1]);
    }
    error(msg: LogMsg): void {
        console.log('|_(")_|  ', chalk.red('Error: ' + msg[0]), '\n');
        this.logInLoop(msg[1]);
    }
}

export = new Logger();
