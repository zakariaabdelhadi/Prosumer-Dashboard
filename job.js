const axios = require('axios');
const energyManagementSystem = require('./EnergieManagmentSystem.js')
const ems2 = require('./ems_Szenario2.js')
const ems3 = require('./ems_Szenario3.js')



// Eine Menge von URLs
const urls = [
  'http://localhost:5001/api/wetter/wetter-current',
  'http://localhost:5001/api/verbrauch/consumptionNew',
  'http://localhost:5001/api/strom/electGen',
  'http://localhost:5001/api/markt/preis'
    //'http://localhost:5001/api/strom/current',

  // Weitere URLs hier...
];
let generatedPower, householdLoad, electricityPrice;


// Funktion, um eine einzelne URL aufzurufen
async function fetchUrl(url) {
  try {
    switch(url){

      case 'http://localhost:5001/api/markt/preis': 
        electricityPrice  = await axios.get(url);  
        return electricityPrice;
      

      case 'http://localhost:5001/api/verbrauch/consumptionNew': 
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
    console.error(`Fehler beim Aufrufen von URL ${url}:`, error.message);
  }
}

// Funktion, um alle URLs nacheinander aufzurufen
 async function fetchAllUrls(urls) {
  for (const url of urls) {
    await  fetchUrl(url);
   

  }

  let preis = getGesamtPreis(parseFloat(electricityPrice.data.value));
  console.log( 'Gen: ' + parseFloat(generatedPower.data.value/1000)+' kW  |  Cons: '+parseFloat(householdLoad.data.value/1000)+' kWh  |  preis: '+ preis + ' Cents')
  energyManagementSystem(parseFloat(generatedPower.data.value/1000),parseFloat(householdLoad.data.value/1000),preis); // preis pro kWh in cent
  ems2(parseFloat(generatedPower.data.value/1000),parseFloat(householdLoad.data.value/1000),preis); // preis pro kWh in cent
  ems3(parseFloat(generatedPower.data.value/1000),parseFloat(householdLoad.data.value/1000),preis); // preis pro kWh in cent

  

}
function getGesamtPreis(gh_preis) {
  // Annahme: Alle Werte sind in Cent

  // Kosten für die Strombeschaffung, Vertrieb und Gewinnmarge (Beispielwert)
  let kostenStrombeschaffung = 8.54;

  // Steuern: Umsatzsteuer und Stromsteuer (Beispielwerte)
  let umsatzsteuer = 5; // 19%
  let stromsteuer = 2; // 2 Cent pro kWh

  // Netznutzungsentgelt inklusive Abrechnung (Beispielwert)
  let netznutzungsentgelt = 3.12;

  // Messstellenbetrieb (Beispielwert)
  let messstellenbetrieb = 2;

  // Umlagen (Beispielwerte)
  let konzessionsabgabe = 2;// Abgabe
  let umlageKWKG = 1;
  let umlageStromNEV = 0.5;
  let offshoreNetzumlage = 1;
  let umlageAbschaltbareLasten = 0.5;

  // Berechnung des Gesamtpreises
  let realPreis =
      gh_preis +
      kostenStrombeschaffung +
      netznutzungsentgelt +
      messstellenbetrieb +
      (gh_preis * umsatzsteuer) / 100 +
      (gh_preis * stromsteuer) / 100 +    
      konzessionsabgabe +
      umlageKWKG +
      umlageStromNEV +
      offshoreNetzumlage +
      umlageAbschaltbareLasten;

  return realPreis;
}
  module.exports = function(){


    fetchAllUrls(urls);
    // Setze das Intervall für alle Viertelstunden (15 * 60 * 1000 ms = 900000 ms)
    setInterval(() => {

      console.log('---------------------' + new Date() + '----------------------');
      fetchAllUrls(urls);

    }, 900000);


  }
  
 