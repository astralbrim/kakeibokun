import {AxiosResponse} from 'axios';
const express = require('express');
const axiosBase = require('axios');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3005;
const config = require('./config');

const app = express();
const getImageEndpoint = axiosBase.create({
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
app.post('/webhook', line.middleware(config), (req: any, res: any) => {
  getImageEndpoint
    .get(
      'https://api-data.line.me/v2/bot/message/' +
        req.body.events[0].message.id +
        '/content',
      {
        responseType: 'arraybuffer',
      }
    )
    .then((response: AxiosResponse<any>) => {
      console.log(Buffer.from(response.data, 'binary').toString('base64'));
    })
    .catch((error: AxiosResponse<any>) => {
      console.log(error);
    });
});

app.listen(PORT);
