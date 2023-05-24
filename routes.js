const express = require('express')
const router = express.Router();
//import fetch from "node-fetch";
const fetch = require('node-fetch');


router.get("/wetter", (req, res) => {

    // install node-fetch module
    //this link is to use for forecast 
    //let apiLink = 'http://api.openweathermap.org/data/2.5/forecast?id=524901&exclude=hourly,daily&appid=${{secrets.OPEN_WHEATHER_API}}';

    // Berlin location
    let lon = 13.4105;
    let lat = 52.5244;
    let apiLink = `https://api.openweathermap.org/data/2.5/onecall?lon=${lon}&lat=${lat}&appid=${{secrets.OPEN_WHEATHER_API}}&exclude=hourly,current,minutely,alerts&units=metric`;

    fetch(apiLink)
        .then(fetchres => fetchres.json())
        .then(json => {


            let list = [];
            let vorhersagen = json.daily;

            vorhersagen.forEach(element => {

                list.push({

                    dt: unix_to_date(element.dt),
                    temperatur: element.temp.day


                })

            });
            res.json(list);

        });

});

router.get("/wetter-current", (req, res) => {


    // install node-fetch module
    //this link is to use for forecast 
    let stadt = 'berlin'
    let apiLink = 'https://api.openweathermap.org/data/2.5/weather?q=' + stadt + '&appid=${{secrets.OPEN_WHEATHER_API}}&units=metric';
    fetch(apiLink)
        .then(fetchres => fetchres.json())
        .then(json => {
            res.json(
                {
                    dt: unix_to_date(json.dt),
                    date: get_currentTime(),
                    temperatur: json.main.temp

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
module.exports = router;
