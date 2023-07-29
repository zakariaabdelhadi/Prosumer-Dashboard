const express = require('express')
const redis = require("redis");
const router = express.Router();
//import fetch from "node-fetch";
const fetch = require('node-fetch');
// read.js
const fs = require('fs');
const readline = require('readline')

const routes1_module = require('./routes1')
const prom_client = require('prom-client')

let lock = 0;

const register = routes1_module.wetter_register;
const stromPreisGauge = new prom_client.Gauge({
    name: 'strom_preis_metric', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [routes1_module.wetter_register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });


  let [m,t,s] = getCurrentTime();

router.get("/preise", getPreise, (req, res) => {




});



function getPreise(req, res, next) {



    let counter = 0;
    let value = 0;

    const readStream = fs.createReadStream('daten/preise.csv', 'utf-8');
    let rl = readline.createInterface({ input: readStream });
    rl.on('line', (line) => {
        counter++;


        let tag = line.split(',')[0].split('.')[0];
        let monat = line.split(',')[0].split('.')[1];
        let stunde = line.split(',')[1].split(':')[0];
        let preis = line.split(',')[2];

        //  console.log(tag, monat, stunde, preis);
        // console.log(req.query.m, req.query.t, req.query.s);


       // if (monat === req.query.m && tag === req.query.t && stunde === req.query.s) {
        //console.log( `---------------monat ${m} tag ${t} Stunde ${s} --------------`)

        //da es nur Daten für Mai gibt 
        m= '05' //MAi
        t= 14 //Tag
        
  

        if (monat == m && tag == t && stunde == s) {

            console.log(monat + '/' + tag + '/' + stunde);
            value = preis;
            stromPreisGauge.set(parseInt(value))
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
    let monat = jetzt.getMonth() + 1; // Januar ist 0, daher muss 1 hinzugefügt werden
    let tag = jetzt.getDate();
    let stunde = jetzt.getHours();


    return [monat, tag, stunde];

}


module.exports = router;
