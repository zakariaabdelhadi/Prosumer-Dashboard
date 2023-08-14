const express = require('express');
const path = require('path');
const logger = require('./logger')
const routes1_module = require('./WetterApiRoutes')
const router2 = require('./StromGenApiRoutes')
const router3 = require('./PreisPrognoseApiRoutes')
const router4 = require('./VerbrauchApiRoutes.js')
const job = require('./job.js')

const bodyparser = require('body-parser')
const cors = require('cors');

const prom_client = require('prom-client');
const { Module } = require('module');

const axios = require('axios');



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


