const express = require('express');
const path = require('path');
const logger = require('./logger')
const router1 = require('./routes')
const router2 = require('./routes2')
const router3 = require('./routes3')
const getAll = require('./getAll')

const bodyparser = require('body-parser')
const cors = require('cors');


const app = express();
const PORT = 5001 || process.env.PORT
app.use(cors());


app.use(logger);
app.use(express.json());
app.use("/api/wetter", router1);
app.use("/api/strom", router2);
app.use("/api/markt", router3);
app.use("/api", getAll);





app.listen(PORT, () => {
    console.log(`app running on port: ${PORT}`)
})
