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
    return new Promise((resolve, reject) => {
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
    const from = msg._data.from;
    if(from===botNum){
        stopWaiting(msg.body);
    }
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

app.get('/send-text-get-first-answer', async (req, res) => {

    let sendTime = Date.now();
    let message = req.query.message;
    client.sendMessage(botNum, message);
    startWaiting().then((botResponse) => {
        console.log('palabra enviada: '+message);
        console.log('respuesta del bot: '+botResponse);
        console.log('demora de en la respuesta:');
        console.log(Date.now() - sendTime);
        res.send(botResponse);
    });


})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})