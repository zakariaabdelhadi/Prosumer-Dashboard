const express = require('express');
const path = require('path');
const logger = require('./logger')
const routes1_module = require('./routes1')
const router2 = require('./routes2')
const router3 = require('./routes3')
const router4 = require('./VerbrauchAPIRoute.js')
const job = require('./job.js')

const bodyparser = require('body-parser')
const cors = require('cors');

const prom_client = require('prom-client');
const { Module } = require('module');

const axios = require('axios');


// Eine Menge von URLs
const urls = [
    'http://localhost:5001/api/wetter/wetter-current',
    'http://localhost:5001/api/strom/current',
    'http://localhost:5001/api/markt/preise',
    'http://localhost:5001/api/verbrauch/'
    // Weitere URLs hier...
  ];




const app = express();
const PORT = 5001 || process.env.PORT
app.use(cors());

app.use(logger);
app.use(express.json());
app.use("/api/wetter", routes1_module.router);
app.use("/api/strom", router2);
app.use("/api/markt", router3);
app.use("/api/verbrauch", router4);

  // Starte den Job
 job();
    
app.listen(PORT, () => {
    console.log(`app running on port: ${PORT}`)
})


