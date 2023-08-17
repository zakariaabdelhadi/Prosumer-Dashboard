const express = require('express')
const router = express.Router();
//import fetch from "node-fetch";
const fetch = require('node-fetch');
const prom_client = require('prom-client')
require('dotenv').config();

// Create a Registry which registers the metrics
const wetter_register = new prom_client.Registry()


const OPEN_WEATHER_API = process.env.OPEN_WEATHER_API;


  const temperaturGauge = new prom_client.Gauge({
    name: 'temperatur_metric', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [wetter_register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
  const CloudsGauge = new prom_client.Gauge({
    name: 'clouds_metric', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [wetter_register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
  const windGauge = new prom_client.Gauge({
    name: 'wind_metric', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [wetter_register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
// Add a default label which is added to all metrics
//wetter_register.setDefaultLabels({
//  app: 'Wetter-Daten'
//})
  
  router.get('/metrics', async (req, res) =>
{

    try {
        const metrics = await wetter_register.metrics();
        res.setHeader('Content-Type',wetter_register.contentType)
        res.end(metrics);
      } catch (ex) {
        res.status(500).end(ex);
      }
  //  wetter_register.metrics().then(data => res.status(200).send(data))
});

router.get("/wetter-current", (req, res) => {

    // install node-fetch module
    //this link is to use for forecast 
    let stadt = 'berlin'
    let apiLink = 'https://api.openweathermap.org/data/2.5/weather?q=' + stadt + '&appid=' + OPEN_WEATHER_API + '&units=metric';
    fetch(apiLink)
        .then(fetchres => fetchres.json())
        .then(json => {
            temperaturGauge.set(json.main.temp);
            windGauge.set(json.wind.speed);
            CloudsGauge.set(json.clouds.all);
            res.json(
                {
                    dt: unix_to_date(json.dt),
                    date: get_currentTime(),
                    temperatur: json.main.temp, // celcius
                    Luftfeuchtigkeit: json.main.humidity, // porcentage
                    Windgeschwindigkeit: json.wind.speed, // meter per sekunde
                    clouds : json.clouds.all //pourcentage

                });

        });

});

function get_currentTime() {

    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function unix_to_date(dt) {

    var now = new Date(dt * 1000);
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;


}
module.exports = {router,wetter_register}
