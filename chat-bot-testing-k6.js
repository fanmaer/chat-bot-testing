import {check, sleep} from 'k6';
import {Client, LocalAuth} from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const appTestNumber = "573160231524@c.us";
export const options = {
    stages: [
        {duration: '10s', target: 1},
        //{duration: '1m10s', target: 10},
        //{duration: '5s', target: 0},
    ],
};


class BotKit {
    client;
    processor;


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
                console.log('Ready!');
                resolve();
            });

            this.client.on('message', async msg => {
                if (msg._data.from.includes('@g.us')) {
                    const from = msg._data.author;
                    this.runHandler(msg, from);

                } else if (msg._data.from.includes('@c.us')) {
                    const from = msg._data.from;
                    this.runHandler(msg, from);
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

    runHandler(msg, from) {
        if (from === appTestNumber) {
            this.processor(msg, from);
        }
    }

    hears(listener) {
        this.processor = listener
    }

    async sendMessage(chatId, content) {
        await this.client.sendMessage(chatId, content);
    }
}

export default async function () {


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

    await bot.sendMessage("573160231524@c.us", "adios");
    sleep(30);


    bot.hears(
        async (msg, from) => {
            console.log(`🎰 message from  AUT (application under test): ${msg}`);
            check(msg, {'Correct response': (r) => r === '¡Fue un gusto atenderte 😃! Cualquier novedad no dudes en comunicarte de nuevo conmigo.'});
            check(msg, {'Incorrect response': (r) => r !== '¡Fue un gusto atenderte 😃! Cualquier novedad no dudes en comunicarte de nuevo conmigo.'});
        });
}


// How to run?
// then install dependencies npm install --save-dev whatsapp-web.js qrcode-terminal crypto-js fs
// install K6
// execute K6 run chat-bot-testing-k6.js
// Pending tasks: unit-test, refactor and use design patterns
