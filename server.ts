const express = require('express');
const line = require('@line/bot-sdk');

const PORT = process.env.PORT || 3002;

const config = {
    channelSecret: "2a6a968ad26a1be7a0fc001d2c6edbb1",
    channelAccessToken: ""
}

const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
    Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
})

const client = new line.Client(config);

async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }
    
    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'Hello' //実際に返信の言葉を入れる箇所
    });
}

app.listen(PORT);

