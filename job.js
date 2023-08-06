const axios = require('axios');

// Eine Menge von URLs
const urls = [
  'http://localhost:5001/api/wetter/wetter-current',
  'http://localhost:5001/api/markt/preis',
  'http://localhost:5001/api/verbrauch/consumption',
  'http://localhost:5001/api/strom/electGen'
    //'http://localhost:5001/api/strom/current',

  // Weitere URLs hier...
];



// Funktion, um eine einzelne URL aufzurufen
async function fetchUrl(url) {
  try {
    const response = await axios.get(url);
    return response;
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
  



}

  module.exports = function(){


    fetchAllUrls(urls);
  
    // Setze das Intervall für alle Viertelstunden (15 * 60 * 1000 ms = 900000 ms)
    setInterval(() => {
      fetchAllUrls(urls);
    }, 900000);


  }
  
  
