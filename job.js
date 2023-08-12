const axios = require('axios');
const energyManagementSystem = require('./EnergieManagmentSystem.js')

// Eine Menge von URLs
const urls = [
  'http://localhost:5001/api/wetter/wetter-current',
  'http://localhost:5001/api/markt/preisOld',
  'http://localhost:5001/api/verbrauch/consumption',
  'http://localhost:5001/api/strom/electGen'
    //'http://localhost:5001/api/strom/current',

  // Weitere URLs hier...
];
let generatedPower, householdLoad, electricityPrice;


// Funktion, um eine einzelne URL aufzurufen
async function fetchUrl(url) {
  try {
    switch(url){

      case 'http://localhost:5001/api/markt/preisOld': 

      //try{
      //  electricityPrice = householdLoad = await axios.get('http://localhost:5001/api/markt/preis');
    //  }catch{
        electricityPrice = householdLoad = await axios.get(url);

      //}
      
      
      return electricityPrice;
      

      case 'http://localhost:5001/api/verbrauch/consumption': 
      householdLoad = await axios.get(url);
      return householdLoad.data.value;

      case 'http://localhost:5001/api/strom/electGen': 
      generatedPower = await axios.get(url);
      return generatedPower.data.value;

      case 'http://localhost:5001/api/wetter/wetter-current':
         let response =await axios.get(url);
         return response;

    }
   
 //   console.log(`URL ${url} wurde aufgerufen. Antwort:`, response.data);
  } catch (error) {
//    console.error(`Fehler beim Aufrufen von URL ${url}:`, error.message);
  }
}

// Funktion, um alle URLs nacheinander aufzurufen
 async function fetchAllUrls(urls) {
  for (const url of urls) {
    await  fetchUrl(url);
  }
  
  energyManagementSystem(generatedPower.data.value,householdLoad.data.value,electricityPrice.data.value);


}

  module.exports = function(){


    fetchAllUrls(urls);
  
    // Setze das Intervall für alle Viertelstunden (15 * 60 * 1000 ms = 900000 ms)
    setInterval(() => {
      fetchAllUrls(urls);
    }, 30000);


  }
  
  
