const express = require('express');
const serverless = require('serverless-http');
const router = express.Router();
const app = express();

const { ethers } = require("ethers");

// MUST match JS + Solidity
function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function generateStringSVGFromHash(hash) {
    const palette = [];
    //mondrian palette
    palette.push(`#fac901`); //y
    palette.push(`#225095`); //blue
    palette.push(`#dd0100`); //red
    palette.push(`#ffffff`); //w
    palette.push(`#000000`); //black
    palette.push("#00770F"); //green: rare 1/256 chance for a til

    const bytes = hexToBytes(hash.slice(2));
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>"
      + "<rect x='0' y='0' width='100' height='100' style='fill:"+palette[parseInt(bytes[0]/51)]+";stroke-width:3;stroke:black'/>" // tile 1
      + "<rect x='0' y='100' width='100' height='100' style='fill:"+palette[parseInt(bytes[1]/51)]+";stroke-width:3;stroke:black'/>" // tile 2
      + "<rect x='0' y='200' width='100' height='100' style='fill:"+palette[parseInt(bytes[2]/51)]+";stroke-width:3;stroke:black'/>" // tile 3
      + "<rect x='100' y='0' width='100' height='100' style='fill:"+palette[parseInt(bytes[3]/51)]+";stroke-width:3;stroke:black'/>" // tile 4
      + "<rect x='100' y='100' width='100' height='100' style='fill:"+palette[parseInt(bytes[4]/51)]+";stroke-width:3;stroke:black'/>" // tile 5
      + "<rect x='100' y='200' width='100' height='100' style='fill:"+palette[parseInt(bytes[5]/51)]+";stroke-width:3;stroke:black'/>" // tile 6
      + "<rect x='200' y='0' width='100' height='100' style='fill:"+palette[parseInt(bytes[6]/51)]+";stroke-width:3;stroke:black'/>" // tile 7
      + "<rect x='200' y='100' width='100' height='100' style='fill:"+palette[parseInt(bytes[7]/51)]+";stroke-width:3;stroke:black'/>" // tile 8
      + "<rect x='200' y='200' width='100' height='100' style='fill:"+palette[parseInt(bytes[8]/51)]+";stroke-width:3;stroke:black'/>" // tile 9
      + "</svg>";
  
    return svg;
}

function generateMetadata(req, res) {
    const hash = ethers.BigNumber.from(req.params.id).toHexString();
    const truncated = hash.slice(0,20); // 0x + 9 bytes
    const svg = generateStringSVGFromHash(hash);
    return svg.toString();
}

router.get('/:id', generateMetadata);

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/.netlify/functions/server', router)

module.exports = app
module.exports.handler = serverless(app);
