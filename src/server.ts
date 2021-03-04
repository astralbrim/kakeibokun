import {AxiosResponse} from 'axios';
const express = require('express');
const axiosBase = require('axios');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3005;
const config = require('./config');
const BASE_URL = 'https://api-data.line.me/v2/bot/message';

const app = express();
const getImageEndpoint = axiosBase.create({
  headers: {
    Authorization: 'Bearer ' + config.channelAccessToken,
  },
});

const postMessageEndpoint = axiosBase.create({
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + config.channelAccessToken,
  },
});

console.log('------server is running------');
app.post('/webhook', line.middleware(config), (req: any, res: any) => {
  console.log('------POSTED FROM LINE------');
  getImageEndpoint
    .get(BASE_URL + '/' + req.body.events[0].message.id + '/content', {
      responseType: 'arraybuffer',
    })
    .then((response: AxiosResponse<any>) => {
      console.log('------GOT IMAGE------');
      const result = Buffer.from(response.data, 'binary').toString('base64');
      sendMessage(result, req, [{type: 'text', text: 'Hello'}]);
    })
    .catch((error: AxiosResponse<any>) => {
      console.error(error);
    });
});

const sendMessage = (
  result: string,
  req: any,
  messages: [{type: string; text: string}]
) => {
  postMessageEndpoint
    .post('https://api.line.me/v2/bot/message/reply', {
      replyToken: req.body.events[0].replyToken,
      messages: messages,
    })
    .then((result: AxiosResponse<any>) => {
      console.log('------POSTED MESSAGE TO LINE------');
    })
    .catch((error: AxiosResponse<any>) => {
      console.log(error);
    });
};

app.listen(PORT);
