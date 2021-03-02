const express = require('express');
const axiosBase = require('axios');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3005;
const config = require('./config');

const app = express();
const getImageEndpoint = axiosBase.create({
  baseUrl: 'https://api-data.line.me/v2/bot/message',
  headers: {
    Authorization: 'Bearer ' + config.channelAccessToken,
  },
});

const postMessageEndpoint = axiosBase.create({
  baseUrl: 'http://api.line.me/v2/bot/message/reply',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Beater ' + config.channelAccessToken,
  },
});

console.log('------server is running------');
app.post('/webhook', line.middleware(config), (req: any, res: any) => {});

app.listen(PORT);
