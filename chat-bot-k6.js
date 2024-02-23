import { check, sleep } from 'k6';
const {Client, LocalAuth} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// numero de chatico produccion
const botNum = "573160231524@c.us";
//json ejemplo, posterior una lista de test

let stopWaiting= function(){};

function startWaiting() {
    return new Promise(resolve => {
        stopWaiting = resolve;
    });
}

const client = new Client({
    authStrategy: new LocalAuth(),
    restartOnAuthFail: true, // related problem solution
    puppeteer: {
        headless: true,
        args: ['--no-sandbox']
    }
});
client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    stopWaiting();
    if (msg.body === 'ping') {
        msg.reply('pong');
    }
})

export function setup() {
    client.initialize()
}

export default function () {

    client.sendMessage(botNum, "adios");
    startWaiting().then(() => {
        console.log('llego evento respuesta');
        check(msg, {'Correct response': (r) => r === '¡Fue un gusto atenderte 😃! Cualquier novedad no dudes en comunicarte de nuevo conmigo.'});
    });

    sleep(10);

}

// How to run?
// then install dependencies npm install --save-dev whatsapp-web.js qrcode-terminal crypto-js fs
// execute node chat-bot-testing.js
// Pending tasks: unit-test, refactor and use design patterns
