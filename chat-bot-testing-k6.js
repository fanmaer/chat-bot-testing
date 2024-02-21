import {check, sleep} from 'k6';
import {Client, LocalAuth} from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

export const options = {
    stages: [
        {duration: '10s', target: 20},
        //{duration: '1m10s', target: 10},
        //{duration: '5s', target: 0},
    ],
};


class BotKit {
    client
    commands = {scopes: {}};
    static GROUP_MESSAGE = "group-message";
    static DIRECT_MESSAGE = "direct-message";
    static DEFAULT = "default";

    constructor(client) {
        this.client = client;
    }

    init() {
        return new Promise((resolve, reject) => {
            this.client.on('qr', (qr) => {
                // Generate and scan this code with your phone
                console.log('QR RECEIVED', qr);
                qrcode.generate(qr, {small: true});
            });

            this.client.on('ready', async () => {
                this.commands['ready'] ? this.commands['ready']() : console.log('Ready!');
                resolve();
            });

            this.client.on('message', async msg => {
                if (msg._data.from.includes('@g.us')) {
                    const from = msg._data.author;
                    this.runHandler(BotKit.GROUP_MESSAGE, msg, from);

                } else if (msg._data.from.includes('@c.us')) {
                    const from = msg._data.from;
                    this.runHandler(BotKit.DIRECT_MESSAGE, msg, from);
                } else {
                    console.log('Message from unknown source');
                }
            });

            this.client.initialize();

            this.client.on('disconnected', (reason) => {
                // Destroy and reinitialize the client when disconnected
                this.client.destroy();
                this.client.initialize();
            });
        });
    }

    runHandler(scope, msg, from) {
        for (const [key, handler] of Object.entries(this.commands.scopes[scope])) {
            const regExp = new RegExp(key, "ig");
            if ((regExp && regExp.test && regExp.test(msg.body))
                || (key && key === msg.body)) {
                handler(msg, from);
                break;
            }
        }
    }

    hears(eventName, scope, listener) {
        if (!this.commands.scopes[scope]) {
            this.commands.scopes[scope] = {};
        }
        this.commands.scopes[scope][eventName] = listener;
    }

    async sendMessage(chatId, content) {
        await this.client.sendMessage(chatId, content);
    }
}
export default async function () {

    const elements = [
        "chlo",
        "testing",
        "inem",
        "kchup"
    ];

    const client = new Client({
        authStrategy: new LocalAuth(),
        restartOnAuthFail: true, // related problem solution
        puppeteer: {
            headless: true,
            args: ['--no-sandbox']
        }
    });


    const bot = new BotKit(client);
    await bot.init();
    for (const element of elements) {
        await bot.sendMessage("573007799862@c.us", `🎰 probando con este dato: ${element}`);
        sleep(30);
    }

    bot.hears('(?=.*?\\bbot,).*',
        BotKit.DIRECT_MESSAGE,
        async (msg, from) => {
            console.log(`🎰 message from  AUT (application under test): ${msg}`);
            check(msg, {'Correct response': (r) => r === 'respuesta correcta'});
            check(msg, {'Incorrect response': (r) =>  r === 'respuesta incorrecta'});
        });
}


// How to run?
// then install dependencies npm install --save-dev whatsapp-web.js qrcode-terminal crypto-js fs
// install K6
// execute K6 run chat-bot-testing-k6.js
// Pending tasks: unit-test, refactor and use design patterns
