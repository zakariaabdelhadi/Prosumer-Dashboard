const path = require('path');
const prom_client = require('prom-client')
const register = new prom_client.Registry()

const http_request_counter = new prom_client.Counter({
    name: 'http_request_count',
    help: 'Count of HTTP requests made to my app',
    labelNames: ['method', 'route', 'statusCode'],
  });
register.registerMetric(http_request_counter);

//logger Middleware, loggt wenn eine request kommt + access to req and response
const logger = (req, res, next) => {
     // Increment the HTTP request counter
    http_request_counter.labels({method: req.method, route: req.originalUrl, statusCode: res.statusCode}).inc();
  
    //console.log(path.join(req.protocol,"/",req.hostname));
    // console.log('request to retrieve current wetter daten ..'),
    next();
};

module.exports = logger;