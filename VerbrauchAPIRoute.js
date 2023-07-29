
const express = require('express');
const redis = require("redis");
const router = express.Router();
//import fetch from "node-fetch";
const fetch = require('node-fetch');
// read.js
const fs = require('fs');
const readline = require('readline')

const routes1_module = require('./routes1')
const prom_client = require('prom-client')



const register = routes1_module.wetter_register;
const stromVerbrauchGauge = new prom_client.Gauge({
    name: 'strom_verbrauch_metric', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [routes1_module.wetter_register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });


  let [stunde,minute] = getCurrentTime();

  router.get("/", getVerbrauch, (req, res) => {




  });

  function getVerbrauch(req, res, next) {



    let counter = 0;
    let value = 0;

    const readStream = fs.createReadStream('daten/Realisierter_Stromverbrauch_viertelstunde.csv', 'utf-8');
    let rl = readline.createInterface({ input: readStream });
    rl.on('line', (line) => {
        counter++;


        let zeit = line.split(';')[1];
        let verbrauch = line.split(';')[3];
  
        if (zeit == stunde+':'+minute) {
            value = verbrauch;
            stromVerbrauchGauge.set(parseInt(value))
        }


    });
    rl.on('close', () => {
        console.log(`About ${counter} areas have geographic units of over 200 units in 2020`)
        console.log('Data parsing completed');
    });

    readStream.on('error', (error) => console.log(error.message));
    readStream.on('data', (chunk) => {

        // console.log(chunk)
    });
    readStream.on('end', () => {

        console.log(value)
        res.send(value);
        console.log('Reading complete')
        next();

    });
};

function getCurrentTime() {


    let jetzt = new Date();
    let stunde = jetzt.getHours();
    let minute = jetzt.getMinutes();

    minute = Math.floor(minute / 15) * 15;

    if(minute=='0') minute='00'


    return [stunde,minute];

}

module.exports = router;