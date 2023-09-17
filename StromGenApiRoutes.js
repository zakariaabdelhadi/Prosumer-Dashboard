const express = require('express')
const redis = require("redis");
const router = express.Router();

//import fetch from "node-fetch";
const fetch = require('node-fetch');
const axios = require('axios');

// read.js
const fs = require('fs');
const readline = require('readline')

const routes1_module = require('./WetterApiRoutes')
const prom_client = require('prom-client')

require('dotenv').config();

let heutevor = [], morgenvor = [], ubermorgenvor = [];
let lockMonat1 = true;
let lockMonat2 = true;

const NREL_KEY =  'bRLrzOOFeHPpnRnqxxzskorqS298hf6JiND8iBFB'; 
const register = routes1_module.wetter_register;
const erzeugterStromGauge = new prom_client.Gauge({
    name: 'erzeugterStrom_metric', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });

  router.get("/electGen", async (req, res) => {

    const options = {
      method: 'GET',
      url: 'https://developer.nrel.gov/api/pvwatts/v8.json',
      params: {
        system_capacity: '15', //Die übliche Speicherkapazität für Ein- und Mehrfamilienhäuser liegt bei etwa 4 kW bis 16 kW.
        module_type:'0',
        losses: '10',
        array_type:'1',
        tilt:'30',
        azimuth : '80',
        dataset: 'intl',
        timeframe:'hourly',
        lat: '52.5162',
        lon: '13.3777'
      },
      headers: {
        'X-Api-Key': process.env.NREL_PVWATT_KEY,
        'X-RapidAPI-Host': 'https://developer.nrel.gov'
      }
    };
    
    try {
        const response = await axios.request(options);
        let index = getCurrentHourIndexInYear();
        let value = response.data.outputs.ac[index]
        erzeugterStromGauge.set(parseFloat(value/1000))
        res.json({"value":value});
    } catch (error) {

        console.log('NREL_PVWATT API Außer betrieb - Daten aus der lokalen Datei holen ... ')
        getProducedElecInCurrentHour(req,res);
       // erzeugterStromGauge.set(parseFloat(800/1000))
        //res.json({"value":800});
     //   console.error(error);

    }
   
});




































//----------------------------------------- Irrelevant ----------------------------------------
router.get("/vorhersage", getProducedElecInvorhersage, (req, res) => {


    //let [heute,morgen,ubermorgen] =  getProducedElecInvorhersage();
    //console.log(heute,morgen,ubermorgen);

    //let vorhessage = getProducedElecInCurrentHour(6, 7, 10);

});

router.get("/current", getProducedElecInCurrentHour, (req, res) => {


    //let [heute,morgen,ubermorgen] =  getProducedElecInvorhersage();
    //console.log(heute,morgen,ubermorgen);

    //let vorhessage = getProducedElecInCurrentHour(6, 7, 10);


});

function getProducedElecInvorhersage(req, res, next) {
    //let data = '';
    let counter = 0;

    const readStream = fs.createReadStream('daten/pvwatts_hourly.csv', 'utf-8');
    let rl = readline.createInterface({ input: readStream });
    rl.on('line', (line) => {


        counter++;
        let monat = line.split(',')[0];
        let tag = line.split(',')[1];
        let stunde = line.split(',')[2];
        let [currMonat, currTag, currStunde] = getCurrentTime();


        if (line.split(',')[0] == currMonat && line.split(',')[1] == currTag) {  //&& line.split(',')[2] == currStunde

            console.log(monat + '/' + tag + '/' + stunde + ' ==> ' + line.split(',')[10]);
            heutevor.push(line.split(',')[10]);
        }

        if (line.split(',')[0] == currMonat && line.split(',')[1] == currTag + 1) { //&& line.split(',')[2] == currStunde
            if (lockMonat1) {
                console.log('-------------------------------------------------')
                lockMonat1 = false;
            }
            console.log(monat + '/' + tag + '/' + stunde + ' ==> ' + line.split(',')[10]);
            morgenvor.push(line.split(',')[10]);
        }

        if (line.split(',')[0] == currMonat && line.split(',')[1] == currTag + 2) {//&& line.split(',')[2] == currStunde
            if (lockMonat2) {
                console.log('---------------------------------------------------')
                lockMonat2 = false;
            }
            console.log(monat + '/' + tag + '/' + stunde + ' ==> ' + line.split(',')[10]);
            ubermorgenvor.push(line.split(',')[10]);
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

        res.send(heutevor + '\n' + morgenvor + '\n' + ubermorgenvor);
        console.log('Reading complete')
        next();



    }

    );

    // return [heutevor, morgenvor, ubermorgenvor];

};

function getProducedElecInCurrentHour(req, res, next) {

    let monatparam = req.query.m;
    let tagparam = req.query.t;
    let stundeparam = req.query.s;

    let [currMonat, currTag, currStunde] = getCurrentTime();

    //let data = '';
    let counter = 0;
    let value = 0;

    const readStream = fs.createReadStream('daten/pvwatts_hourly.csv', 'utf-8');
    let rl = readline.createInterface({ input: readStream });
    rl.on('line', (line) => {


        counter++;
        let monat = line.split(',')[0];
        let tag = line.split(',')[1];
        let stunde = line.split(',')[2];
        // let [currMonat,currTag,currStunde] = getCurrentTime();

        if (line.split(',')[0] == currMonat && line.split(',')[1] == currTag && line.split(',')[2] == currStunde) {
            console.log(monat + '/' + tag + '/' + stunde);
            // readStream.close();
            value = line.split(',')[10];
            erzeugterStromGauge.set(parseFloat(value/1000));
        }
    });
    rl.on('close', () => {
      //  console.log(` ${counter} pv werte gelesen`)
        console.log('Data parsing completed');
    });

    readStream.on('error', (error) => console.log(error.message));
    readStream.on('data', (chunk) => {

        // console.log(chunk)
    });
    readStream.on('end', () => {

        res.json({"value":value});
        console.log('Reading PV-Watts values complete')

        if(next != null){
            next();
        }
    });
};


function getCurrentTime() {


    let jetzt = new Date();
    let monat = jetzt.getMonth() + 1; // Januar ist 0, daher muss 1 hinzugefügt werden
    let tag = jetzt.getDate();
    let stunde = jetzt.getHours();


    return [monat, tag, stunde];

}
function getCurrentHourIndexInYear() {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 0); // January 0th is the last day of the previous year
    const timeDiff = now - yearStart;
    const hourIndex = Math.floor(timeDiff / (1000 * 60 * 60)); // Convert milliseconds to hours
    return hourIndex;
  }
  
module.exports = router;