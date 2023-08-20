
const express = require('express');
const redis = require("redis");
const router = express.Router();
//import fetch from "node-fetch";
const fetch = require('node-fetch');
// read.js
const fs = require('fs');
const readline = require('readline')

const routes1_module = require('./WetterApiRoutes')
const prom_client = require('prom-client');
const { log } = require('console');



const register = routes1_module.wetter_register;
const stromVerbrauchGauge = new prom_client.Gauge({
    name: 'strom_verbrauch_metric', // The name of the metric
    help: 'gauge metric Wh', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });


  let [stunde,minute] = getCurrentTimeCustom();
  let [monat,tag,std,min] = getCurrentTime();

  

  router.get("/consumption", getConsumption, (req, res) => {


  });


  function getConsumption(req, res, next) {


    let counter = 0;
    let value = 0;


    const readStream = fs.createReadStream('daten/household_power_consumption_2023.csv', 'utf-8');
    let rl = readline.createInterface({ input: readStream });
    rl.on('line', (line) => {
        counter++;


        let heute = line.split(';')[0];
        let zeit = line.split(';')[1];
        let verbrauch = parseInt(line.split(';')[6]) +parseInt(line.split(';')[7]) +parseInt(line.split(';')[8]);

        //console.log(heute +'--------------'+tag+'/'+monat);
  
        if (zeit == std+':'+min  && heute == tag+'/'+monat) {

            value = verbrauch;
            stromVerbrauchGauge.set(parseInt(value))
        }


    });
    rl.on('close', () => {
      //  console.log(` ${counter} verbrauchtsdaten gelesen`)
        console.log('Data parsing Haushaltsverbrauchtsdaten completed');
    });

    readStream.on('error', (error) => console.log(error.message));
    readStream.on('data', (chunk) => {

        // console.log(chunk)
    });
    readStream.on('end', () => {

     //   console.log(value.va)
        res.json({"value":value});
        console.log('Reading HaushaltsverbrauchDaten complete')
        next();

    });


  }


  router.get("/consumptionNew", getConsumption2, (req, res) => {


  });


  function getConsumption2(req, res, next) {


    let counter = 0;
    let value = 0;


    const readStream = fs.createReadStream('daten/ConsommationParHeure.csv', 'utf-8');
    let rl = readline.createInterface({ input: readStream });
    rl.on('line', (line) => {
        counter++;


        let zeit = line.split(';')[0];
        let verbrauch = parseInt(line.split(';')[1]);

  
        if (zeit == stunde+':'+minute ) {
            value = verbrauch;
            stromVerbrauchGauge.set(parseInt(value))
        }


    });
    rl.on('close', () => {
      //  console.log(` ${counter} verbrauchtsdaten gelesen`)
        console.log('Data parsing Haushaltsverbrauchtsdaten completed');
    });

    readStream.on('error', (error) => console.log(error.message));
    readStream.on('data', (chunk) => {

        // console.log(chunk)
    });
    readStream.on('end', () => {

     //   console.log(value.va)
        res.json({"value":value});
        console.log('Reading HaushaltsverbrauchDaten complete')
        next();

    });


  }


function getCurrentTimeCustom() {


    let jetzt = new Date();
    let stunde = jetzt.getHours();
    let minute = jetzt.getMinutes();

    minute = '00';



    return [stunde,minute];

}
function getCurrentTime() {


    let jetzt = new Date();
    let monat = jetzt.getMonth() + 1; // Januar ist 0, daher muss 1 hinzugefügt werden
    let tag = jetzt.getDate();
    let stunde = jetzt.getHours();
    let minute = jetzt.getMinutes();



    return [monat, tag, stunde,minute];

}

module.exports = router;