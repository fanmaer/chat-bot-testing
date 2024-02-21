const {Client, LocalAuth} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// numero de chatico produccion
const botnum = "573160231524@c.us";
//json ejemplo, posterior una lista de test
const test1 = [
    {
        request:{
            sendText:"adios",
            sendOption: null
        },
        response:{
            //cada request pude tener multiples mensajes de respuesta, este campo pude ser una lista
            regexToTest:"(?=.*?\\bCualquier novedad no dudes en comunicarte de nuevo).*",
            testFunction: async (msg, from) => {
                //const regExp = new RegExp(this.regexToTest, "ig");
                const regExp = new RegExp("(?=.*?\\bCualquier novedad no dudes en comunicarte de nuevo).*", "ig");
                if (regExp && regExp.test && regExp.test(msg.body)) {
                    console.log("TEST OK");
                } else {
                    console.log("TEST FAIL");
                }
            }
        }
    }
];

class BotKit {
    client
    //commands = {scopes: {}};
    proccesor
    static GROUP_MESSAGE = "group-message";
    static DIRECT_MESSAGE = "direct-message";
    static DEFAULT = "default";
    currentStep = 0;
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
        console.log(msg.body);
        console.log(from);
        if(from===botnum){
            this.proccesor(msg, from);            
        }

    }
    responseProcessor(step, proccesor ){
        this.proccesor= proccesor
    }

    async sendMessage(chatId, content) {
        await this.client.sendMessage(chatId, content);
    }
}
const timer = ms => new Promise(res => setTimeout(res, ms))


main = async function () {

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
    for (var i = 0; i < 3; i++) {
        bot.responseProcessor(0,test1[0].response.testFunction);
        await bot.sendMessage(botnum, test1[0].request.sendText);
        await timer(10000); // then the created Promise can be awaited
    }

}
main().then();


// How to run?
// then install dependencies npm install --save-dev whatsapp-web.js qrcode-terminal crypto-js fs
// execute node chat-bot-testing.js
// Pending tasks: unit-test, refactor and use design patterns
