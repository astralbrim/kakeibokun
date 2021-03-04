import {AxiosResponse} from 'axios';
const express = require('express');
const axiosBase = require('axios');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3005;
const config = require('./config');

const app = express();
const getImageEndpoint = axiosBase.create({
  headers: {
    Authorization: 'Bearer ' + config.line.channelAccessToken,
  },
});

const postMessageEndpoint = axiosBase.create({
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + config.line.channelAccessToken,
  },
});

const postImageEndpoint = axiosBase.create({
  headers: {
    Authorization: 'Bearer ' + config.google.token,
    'Content-Type': 'application/json',
  },
});

console.log('------server is running------');
app.post('/webhook', line.middleware(config.line), (req: any) => {
  console.log('------POSTED FROM LINE------');
  getImage(req, [postImageText, sendMessage]);
});

const getImage = (req: any, afterGetFunction: [Function, Function]) => {
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
      console.log('------GOT IMAGE------');
      const result = Buffer.from(response.data, 'binary').toString('base64');
      afterGetFunction[0](result);
      afterGetFunction[1](result, req, [
        {type: 'text', text: '田村ンゴがうんちぶり子したンゴ！'},
      ]);
    })
    .catch((error: AxiosResponse<any>) => {
      console.error(error);
    });
};
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
    .then(() => {
      console.log('------POSTED MESSAGE TO LINE------');
    })
    .catch((error: AxiosResponse<any>) => {
      console.log(error);
    });
};

const postImageText = (image: string) => {
  postImageEndpoint
    .post('https://vision.googleapis.com/v1/images:annotate', {
      requests: [
        {
          image: {
            content: image,
          },
          features: [
            {
              type: 'LABEL_DETECTION',
            },
          ],
        },
      ],
    })
    .then((result: AxiosResponse<any>) => {
      console.log(result.data.responses[0].textAnnotations);
    });
};

app.listen(PORT);
