
const express = require('express')
const router = express.Router();

const routes1_module = require('./WetterApiRoutes')
const register =  routes1_module.wetter_register;


 
router.get('/', async (req, res) =>
{

    try {
        const metrics = await register.metrics();
        res.setHeader('Content-Type',register.contentType)
        res.end(metrics);
      } catch (ex) {
        res.status(500).end(ex);
      }
  //  wetter_register.metrics().then(data => res.status(200).send(data))
});



module.exports = router;