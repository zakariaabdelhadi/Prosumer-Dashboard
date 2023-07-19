const express = require('express')
const redis = require("redis");
const router = express.Router();
//import fetch from "node-fetch";
const fetch = require('node-fetch');
// read.js
const fs = require('fs');
const readline = require('readline')




router.get("/preise", getPreise, (req, res) => {




});



function getPreise(req, res, next) {



    let counter = 0;
    let value = 0;

    const readStream = fs.createReadStream('preise.csv', 'utf-8');
    let rl = readline.createInterface({ input: readStream });
    rl.on('line', (line) => {
        counter++;


        let tag = line.split(',')[0].split('.')[0];
        let monat = line.split(',')[0].split('.')[1];
        let stunde = line.split(',')[1].split(':')[0];
        let preis = line.split(',')[2];

        //  console.log(tag, monat, stunde, preis);
        // console.log(req.query.m, req.query.t, req.query.s);


        if (monat === req.query.m && tag === req.query.t && stunde === req.query.s) {
            console.log(monat + '/' + tag + '/' + stunde);
            value = preis;
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



module.exports = router;
