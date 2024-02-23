const {Client, LocalAuth} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const express = require('express')
const app = express()
const port = 3000

const timer = (ms) => {
    return new Promise(res => setTimeout(res, ms))
}

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

client.initialize();

app.get('/', async (req, res) => {

    let sendTime = Date.now();

    client.sendMessage(botNum, "adios");
    startWaiting().then(() => {
        console.log('llego evento respuesta, tiempo :');
        console.log(Date.now() - sendTime);
        res.send('Hello World!');
    });


})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})