const {Client, LocalAuth} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const winston = require('winston');
let logger;
logger = winston.createLogger({
    transports: [
        new winston.transports.File({
            filename: 'log/combined.log',
            timestamp: true,
            maxsize: 5120000,
            maxFiles: 20,
            format: winston.format.combine(
                winston.format.timestamp({
                    format: "YYYY-MM-DD HH:mm:ss",
                }),
                winston.format.json()
            ),
        })
    ]
});

const express = require('express')
const app = express()
const port = 3000

const timer = (ms) => {
    return new Promise(res => setTimeout(res, ms))
}

// numero de chatico produccion
const botNum = "573160231524@c.us";
// esta listo el waap-web para enviar mensajes
let botReady= false;
// 30 segundos espera maxima
let maxTime = 30000;
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

function startWaitingTimeout(searchWord) {
    if(! searchWord) {
        searchWord = " ";
    }
    wordInMessage = searchWord;
    return new Promise((resolve, reject) => {
        // la promesa se resuelve por ejecucion de stopWaiting por "on message" o por "time out"
        stopWaiting = resolve;
        setTimeout(stopWaiting,maxTime)
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
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    logger.info(msg,{tag:'on_message_all',desc:'llega mensaje'});
    const from = msg._data.from;
    if(from===botNum && msg.body.includes(wordInMessage)){
        logger.info(msg,{tag:'on_message_fom_chatico',desc:'llega mensaje de chatico'});
        stopWaiting(msg);
    }
    if (msg.body === 'ping') {
        msg.reply('pong');
    }
})

client.on('message_ack', (msg, ack) => {
    logger.info(msg,{tag:'on_message_ack',desc:'ack mensaje',ack:ack});
})


client.initialize().then(r => {
    console.log("incializar exitoso");
    logger.info("whatsapp-web.js inicializa exitoso")
    botReady = true;
    console.log(r);
}).catch(r=>{
    console.log("ERROR incializar cliente waap fallido");
    logger.info("whatsapp-web.js inicializa fallido")
    logger.info(r);
    console.log(r);
});


app.get('/', async (req, res) => {
        res.send('Hello World! botReady =  '+botReady );
})

app.get('/send-text-get-first-answer', async (req, res) => {

    if(!botReady){
        res.status(503);
        res.send("botReady "+botReady);
        res.end();
    }else{

    let sendTime = Date.now();
    let message = req.query.message;
    client.sendMessage(botNum, message);
    startWaiting(" ").then((msg) => {
        console.log('palabra enviada: '+message);
        console.log('respuesta del bot: '+msg.body);
        console.log('demora de en la respuesta:');
        console.log(Date.now() - sendTime);
        console.log(msg);
        res.send(msg.body);
    });
    }

})

app.get('/send-text-get-first-answer-metrics-adios', async (req, res) => {

    if(!botReady){
        res.status(503);
        res.send("botReady "+botReady);
        res.end();
    }else {
        let sendTime = Date.now();
        let message = "adios";
        console.log("nuevo request de mensaje ---------------------------");
        console.log("fecha hora:");
        console.log(Date());
        client.sendMessage(botNum, message).then((msg) => {
            logger.info(msg,{tag:'sendMessage',desc:'se cumple promesa de envio de mensaje'});
        }).catch(reason => {
            logger.error(reason,{tag:'sendMessage_error',desc:'no se pudo enviar mensaje'});
        });
        startWaitingTimeout(" ").then((msg) => {
            if(msg) {
                console.log('palabra enviada: ' + message);
                console.log('respuesta del bot: ' + msg.body);
                console.log('demora de en la respuesta:');
                let time = Date.now() - sendTime;
                console.log(time);
                console.log('_____________________');
                logger.info(msg,{tag:'on_message_less30sg',desc:'llega mensaje antes de 30 segudos de espera'});
                res.type('txt');
                res.send("time " + time + "\n" + "timeOut " + 0);
            } else {
                console.log('palabra enviada: ' + message);
                console.log('time out bot t>= ' + maxTime);
                console.log('_____________________');
                logger.warn('timeout',{tag:'on_message_more30sg',desc:'no llega mensaje, timeout 30 seg'});
                res.type('txt');
                res.send("time " + maxTime + "\n" + "timeOut " + 1);
            }

        });

    }
})

app.get('/send-text-get-first-answer-metrics-adios-turismo-adios', async (req, res) => {

    if(!botReady){
        res.status(503);
        res.send("botReady "+botReady);
        res.end();
    }else {

        let sendTime = Date.now();
        let time1 = 0;
        let time2 = 0;
        let time3 = 0;
        //let message = "adios";
        client.sendMessage(botNum, "adios").then(r => {
            sendTime = Date.now();
        });
        startWaiting("no dudes").then((msg) => {
            console.log('palabra enviada: ' + "adios");
            console.log('respuesta del bot: ' + msg.body);
            console.log('demora de en la respuesta:');
            time1 = Date.now() - sendTime;
            console.log(time1);
            client.sendMessage(botNum, "turismo").then(r => {
                sendTime = Date.now();
            });
            startWaiting("puedo ayudar en algo m").then((msg) => {
                console.log('palabra enviada: ' + "turismo");
                console.log('respuesta del bot: ' + msg.body);
                console.log('demora de en la respuesta:');
                time2 = Date.now() - sendTime;
                console.log(time2);
                client.sendMessage(botNum, "adios").then(r => {
                    sendTime = Date.now();
                });
                startWaiting("no dudes").then((msg) => {
                    console.log('palabra enviada: ' + "adios");
                    console.log('respuesta del bot: ' + msg.body);
                    console.log('demora de en la respuesta:');
                    time3 = Date.now() - sendTime;
                    let timeTotal = time1 + time2 + time3;
                    console.log(time3);
                    res.type('txt');
                    res.send("time " + time1 + "\n" + "time1Adios " + time1 + "\n" + "time2Turismo " + time2 + "\n" + "time3Adios " + time3 + "\n" + "timeTotalTurismo " + timeTotal);
                });
            });
        });

    }
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})