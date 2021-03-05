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
  api(req);
});

const api = (req: any) => {
  getImageEndpoint
    .get(
      'https://api-data.line.me/v2/bot/message/' +
        req.body.events[0].message.id +
        '/content',
      {
        responseType: 'arraybuffer',
      }
    )
    .then((getImageResponse: AxiosResponse<any>) => {
      console.log('------GOT IMAGE------');
      const result = Buffer.from(getImageResponse.data, 'binary').toString(
        'base64'
      );
      postImageEndpoint
        .post('https://vision.googleapis.com/v1/images:annotate', {
          requests: [
            {
              image: {
                content: result,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                },
              ],
            },
          ],
        })
        .then((postImageResponse: AxiosResponse<any>) => {
          postMessageEndpoint
            .post('https://api.line.me/v2/bot/message/reply', {
              replyToken: req.body.events[0].replyToken,
              messages: [
                {
                  type: 'text',
                  text: postImageResponse.data.responses[0].textAnnotations,
                },
              ],
            })
            .then(() => {
              console.log('------POSTED MESSAGE TO LINE------');
            })
            .catch((error: AxiosResponse<any>) => {
              console.log(error);
            });
        });
    })
    .catch((error: AxiosResponse<any>) => {
      console.error(error);
    });
};

app.listen(PORT);
