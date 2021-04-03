const express = require('express');
const serverless = require('serverless-http');
const { ethers } = require('ethers');
const svg2png = require("svg2png");


const router = express.Router();

const app = express();
app.listen(8080);

// MUST match JS + Solidity
const hexToBytes = (hex) => {
   for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substr(c, 2), 16));
   return bytes;
};

const generateStringSVGFromHash = (hash) => {
   //mondrian palette
   const palette = [
      '#f3ba2f', //y
      '#FE0879', //blue
      '#FF82E2', //red
      '#0037B3', //w
      '#70BAFF', //black
      '#edffb1', // 1/256chanvce
   ];

   const bytes = hexToBytes(hash.slice(2));
   const svg ="<?xml version='1.0' encoding='utf-8'?><!DOCTYPE svg>" +
      "<svg version='1.1' x='0px' y='0px' width='300px' height='300px' viewBox='0 0 126 126.611' enable-background='new 0 0 126 126.611' xml:space='preserve' " +
      '>' +
      "<rect id='rect4' height='126' width='126' fill='" +
      palette[parseInt(bytes[5] / 51)] +
      "'  y='0' x='0' />" +
      "<polygon fill='" +
      palette[parseInt(bytes[0] / 51)] +
      "' points='38.171,53.203 62.759,28.616 87.36,53.216 101.667,38.909 62.759,0 23.864,38.896 '/>" +
      "<rect x='3.644' y='53.188' transform='matrix(0.7071 0.7071 -0.7071 0.7071 48.7933 8.8106)' fill='" +
      palette[parseInt(bytes[8] / 51)] +
      "' width='20.233' height='20.234'/>" +
      "<polygon fill='" +
      palette[parseInt(bytes[1] / 51)] +
      "' points='38.171,73.408 62.759,97.995 87.359,73.396 101.674,87.695 101.667,87.703 62.759,126.611 23.863,87.716 23.843,87.696 '/>" +
      "<rect x='101.64' y='53.189' transform='matrix(-0.7071 0.7071 -0.7071 -0.7071 235.5457 29.0503)' fill='" +
      palette[parseInt(bytes[3] / 51)] +
      "' width='20.234' height='20.233'/>" +
      "<polygon fill='" +
      palette[parseInt(bytes[2] / 51)] +
      "' points='77.271,63.298 77.277,63.298 62.759,48.78 52.03,59.509 52.029,59.509 50.797,60.742 48.254,63.285 48.254,63.285 48.234,63.305 48.254,63.326 62.759,77.831 77.277,63.313 77.284,63.305 '/>" +
      '</svg>';

   return svg;
};

const hashGenerator = (_id) => {
   if (!_id.includes('png')) {
      return ethers.BigNumber.from(_id).toHexString();
   }
   return ethers.BigNumber.from(_id.split('.')[0]).toHexString();
};

const generateMetadata = async(req, res) => {
   const id = req.params.id;
   const hash = hashGenerator(id);
   const truncated = hash.slice(0, 20); // 0x + 9 bytes
   const svg = generateStringSVGFromHash(hash);

   if (!id.includes('png')) {
      const imageUrl =
         req.protocol + '://' + req.headers.host + req.originalUrl + '.png';

      return res.status(200).json({
         name: 'BSCpop ' + truncated,
         description: 'Your BSCpopART',
         image_data: svg,
         image: imageUrl,
      });
   }
   try {
   var png = svg2png(Buffer.from(svg));
   res.type("image/png");}
    catch (error) {
      console.error(error);

    }
   return res.status(200).send(png);
};

router.get('/:id', generateMetadata);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/.netlify/functions/server', router);

module.exports = app;
module.exports.handler = serverless(app);
