const express = require('express')
const redis = require("redis");
const router = express.Router();
//import fetch from "node-fetch";
const fetch = require('node-fetch');
// read.js
const fs = require('fs');
const readline = require('readline')



let heutevor = [], morgenvor = [], ubermorgenvor = [];
let lockMonat1 = true;
let lockMonat2 = true;


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

    const readStream = fs.createReadStream('pvwatts_hourly.csv', 'utf-8');
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
    //let data = '';
    let counter = 0;
    let value = 0;

    const readStream = fs.createReadStream('pvwatts_hourly.csv', 'utf-8');
    let rl = readline.createInterface({ input: readStream });
    rl.on('line', (line) => {


        counter++;
        let monat = line.split(',')[0];
        let tag = line.split(',')[1];
        let stunde = line.split(',')[2];
        // let [currMonat,currTag,currStunde] = getCurrentTime();
        if (line.split(',')[0] == monatparam && line.split(',')[1] == tagparam && line.split(',')[2] == stundeparam) {
            console.log(monat + '/' + tag + '/' + stunde);
            // readStream.close();
            value = line.split(',')[10];
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

        res.json(value);
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