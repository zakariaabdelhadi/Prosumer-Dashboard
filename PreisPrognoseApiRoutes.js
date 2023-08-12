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

let lock = 0;

const register = routes1_module.wetter_register;
const stromLocalPreisGauge = new prom_client.Gauge({
    name: 'strom_local_preis_metric', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [routes1_module.wetter_register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
  const stromMarketPreisGauge = new prom_client.Gauge({
    name: 'strom_market_preis_metric', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [routes1_module.wetter_register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
  const stromPreisGauge = new prom_client.Gauge({
    name: 'strom_preis_metric', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [routes1_module.wetter_register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
  let [m,t,s] = getCurrentTime();

router.get("/preis", async (req, res) => {




const optionsOld = {
    method: 'GET',
    url: 'https://api.corrently.io/v2.0/gsi/marketdata',
    params: {zip: '10963'},

  };
  
  const options = {
    method: 'GET',
    url: 'https://marktdaten-deutschland.p.rapidapi.com/marketdata',
    params: {zip: '10963'},
    headers: {
      'X-RapidAPI-Key': '9d0fa79f58msh0f17d31a9e3cec0p178bc2jsn3619ac449c78',
      'X-RapidAPI-Host': 'marktdaten-deutschland.p.rapidapi.com'
    }
  };

try {

	const response = await axios.request(options);

    let value = response.data.data;
    let list=[];

    let [tag,std,min] = getCurrentTimeCustom(); 
    tag=tag+1;

    value.forEach(element => {


        let marketPreis =element.marketprice;
        let localPreis = element.localprice;
      //  const date1 = new Date(1691308800000);

        const date1 = new Date(element.start_timestamp);
        const date2 = new Date(element.end_timestamp);
     
        const config =  { year: '2-digit' ,day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'};
        let startTime = new Intl.DateTimeFormat('de-DE', config).format(date1);
        let endTime = new Intl.DateTimeFormat('de-DE', config).format(date2);

        if(tag == date1.getDate() && std == date1.getHours() && min == date1.getMinutes())
        {    
            list.push({"marketPreis":marketPreis/1000,"localPreis":localPreis/1000,"startTime":startTime,"endTime":endTime});
 
        }

        
    });
   

    stromLocalPreisGauge.set((parseFloat(list[0].localPreis/1000)))
    stromMarketPreisGauge.set((parseFloat(list[0].marketPreis/1000)))

    res.json({"value":list[0].localPreis/1000})
} catch (error) {
	console.error(error);
}




});

router.get("/preisOld", getPreiseOld, (req, res) => {


})



function getPreiseOld(req, res, next) {



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

       
        m= '05' //MAi
        t= 14 //Tag
        
  

        if (monat == m && tag == t && stunde == s) {
            value = parseFloat((preis/1000).toFixed(5));
            stromPreisGauge.set(value); //preis pro kWh
        }


    });
    rl.on('close', () => {
        console.log('Data parsing Preisdaten completed');
    });

    readStream.on('error', (error) => console.log(error.message));
    readStream.on('data', (chunk) => {

        // console.log(chunk)
    });
    readStream.on('end', () => {

        res.json({"value":value}); //preis pro kWh
        console.log('Reading Preisdaten complete')
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
function getStd() {


    let jetzt = new Date();
    let stunde = jetzt.getHours();
    


    return stunde;

}

function getCurrentTimeCustom() {


    let jetzt = new Date();
    let tag = jetzt.getDate();
    let stunde = jetzt.getHours();
    let minute = jetzt.getMinutes();

    minute = Math.floor(minute / 15) * 15;

   // if(minute=='0') minute='00'


    return [tag,stunde,minute];

}
module.exports = router;
