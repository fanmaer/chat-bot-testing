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
let wordInMessage = " ";

function startWaiting(searchWord) {
    if(! searchWord) {
        searchWord = " ";
    }
    wordInMessage = searchWord;
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
    if(from===botNum && msg.body.includes(wordInMessage)){
        stopWaiting(msg);
    }
    if (msg.body === 'ping') {
        msg.reply('pong');
    }
})



function  awaitForResponse() {
    return new Promise((resolve, reject) => {
        stopWaiting = resolve;
    });
}

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
    startWaiting().then((msg) => {
        console.log('palabra enviada: '+message);
        console.log('respuesta del bot: '+msg.body);
        console.log('demora de en la respuesta:');
        console.log(Date.now() - sendTime);
        console.log(msg);
        res.send(msg.body);
    });


})

app.get('/send-text-get-first-answer-metrics-adios', async (req, res) => {

    let sendTime = Date.now();
    let message = "adios";
    console.log("nuevo request de mensaje ---------------------------");
    console.log("fecha hora:");
    console.log(Date());
    client.sendMessage(botNum, message);
    startWaiting().then((msg) => {
        console.log('palabra enviada: '+message);
        console.log('respuesta del bot: '+msg.body);
        console.log('demora de en la respuesta:');
        let time = Date.now() - sendTime;
        console.log(time);
        res.type('txt');
        res.send("time "+time+"\n"+"word "+1);
    });


})

app.get('/send-text-get-first-answer-metrics-adios-turismo-adios', async (req, res) => {

    let sendTime = Date.now();
    let time1 = 0;
    let time2=0;
    let time3= 0;
    //let message = "adios";
    client.sendMessage(botNum, "adios").then(r => {
        sendTime = Date.now();
    });
    startWaiting("no dudes").then((msg) => {
        console.log('palabra enviada: '+"adios");
        console.log('respuesta del bot: '+msg.body);
        console.log('demora de en la respuesta:');
        time1 = Date.now() - sendTime;
        console.log(time1);
        client.sendMessage(botNum, "turismo").then(r => {
            sendTime = Date.now();
        });
        startWaiting("puedo ayudar en algo m").then((msg) => {
            console.log('palabra enviada: '+"turismo");
            console.log('respuesta del bot: '+msg.body);
            console.log('demora de en la respuesta:');
            time2 = Date.now() - sendTime;
            console.log(time2);
            client.sendMessage(botNum, "adios").then(r => {
                sendTime = Date.now();
            });
            startWaiting("no dudes").then((msg) => {
                console.log('palabra enviada: '+"adios");
                console.log('respuesta del bot: '+msg.body);
                console.log('demora de en la respuesta:');
                time3 = Date.now() - sendTime;
                let timeTotal = time1+time2+time3;
                console.log(time3);
                res.type('txt');
                res.send("time "+time1+"\n"+"time1Adios "+time1+"\n"+"time2Turismo "+time2+"\n"+"time3Adios "+time3+"\n"+"timeTotalTurismo "+timeTotal);
            });
        });
    });


})

app.get('/send-text-get-first-answer-metrics-adios-cosas', async (req, res) => {

    let sendTime = Date.now();
    let message = "adios";
    client.sendMessage(botNum, message);
    await client.awaitForResponse("texto esperado");
    let time = Date.now() - sendTime;
    console.log(time);
    res.type('txt');
    res.send("time "+time+"\n"+"word "+1);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})