const routes1_module = require('./WetterApiRoutes')
const prom_client = require('prom-client')


const register = routes1_module.wetter_register;
const ueberschussGauge = new prom_client.Gauge({
    name: 'ueberschuss_metric', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
const batterieStandGauge = new prom_client.Gauge({
    name: 'batterie_stand_metric', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
  const gekaufterStromCounter = new prom_client.Counter({
    name: 'gekaufter_strom_metric', // The name of the metric
    help: 'counter metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
  const ausgabeStromCounter = new prom_client.Counter({
    name: 'ausgabe_strom_metric', // The name of the metric
    help: 'counter metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
  const eingespeisterStromCounter = new prom_client.Counter({
    name: 'eingespeister_strom_metric', // The name of the metric
    help: 'counter metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
  const earnStromCounter = new prom_client.Counter({
    name: 'earning_strom_metric', // The name of the metric
    help: 'counter metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });







  
function simulateEnergyManagement(generatedPower, householdLoad, electricityPrice) {

  electricityPrice =  getGesamtPreis(electricityPrice);        
  
  console.log(generatedPower+'-'+householdLoad+'-'+ electricityPrice)
    let waschmaschine = 0; // 0.7 kWh pro Waschgang
    let geschirspueler = 0; // 0.4 kWh pro spülgang
    let waermepimpe = 0; //Wärmepumpe mit einer Leistung von etwa 5 kW --> 2kWh pro Stunde
   // let auto = 0;
    const batteryCapacity = 15; // Beispielkapazität in kWh
    let batterySOC = 0.5; // Beispiel-Startladestand der Batterie in kWh
    let gekaufterStrom = 0;
    let eingespeisterStrom = 0;

    
    
        // was die Solaranlage momentan nicht leistet - nicht bedeckt
        const netLoad = householdLoad - generatedPower;
        // Berechne den Überschuss oder das Defizit
        const surplus = generatedPower - householdLoad;

        ueberschussGauge.set(surplus);
        // Entscheidung basierend auf Überschuss/Defizit und Batterieladestand

        if (surplus > 0 && batterySOC < 14 && electricityPrice < 210/1000) { // Batterie laden
            console.log("Action : Batterie laden")
            const chargeAmount = Math.min(surplus, batteryCapacity * (1 - batterySOC));
            batterySOC += chargeAmount / batteryCapacity;
        } else if(surplus > 0 && batterySOC > 14 && electricityPrice > 20/1000){ // Strom ins Netz einspeisen
            console.log("Action : Strom ins Netz einspeisen")
            eingespeisterStrom +=surplus;
        }else if (surplus < 0 && batterySOC > 0 && netLoad > 0) { // Strom aus der Batterie nutzen
            console.log("Action : Strom aus der Batterie nutzen")
            const dischargeAmount = Math.min(-surplus, batteryCapacity * batterySOC, netLoad);
            batterySOC -= dischargeAmount / batteryCapacity;
        }else if (surplus < 0 && batterySOC == 0 ){ // strom aus dem Netz
            console.log("Action : strom aus dem Netz beziehen")
            gekaufterStrom += netLoad;
        }

        batterieStandGauge.set(batterySOC);
        gekaufterStromCounter.inc(gekaufterStrom);
        ausgabeStromCounter.inc(gekaufterStrom*electricityPrice)
        eingespeisterStromCounter.inc(eingespeisterStrom);
        earnStromCounter.inc(eingespeisterStrom*electricityPrice)

    }



   

      function getGesamtPreis(marktpreis) {
        // Annahme: Alle Werte sind in Cent
    
        // Kosten für die Strombeschaffung, Vertrieb und Gewinnmarge (Beispielwert)
        let kostenStrombeschaffung = 13.54;
    
        // Steuern: Umsatzsteuer und Stromsteuer (Beispielwerte)
        let umsatzsteuer = 19; // 19%
        let stromsteuer = 2; // 2 Cent pro kWh
    
        // Netznutzungsentgelt inklusive Abrechnung (Beispielwert)
        let netznutzungsentgelt = 8.12;
    
        // Messstellenbetrieb (Beispielwert)
        let messstellenbetrieb = 5;
    
        // Umlagen (Beispielwerte)
        let konzessionsabgabe = 2;// Abgabe
        let umlageKWKG = 1;
        let umlageStromNEV = 0.5;
        let offshoreNetzumlage = 1;
        let umlageAbschaltbareLasten = 0.5;
    
        // Berechnung des Gesamtpreises
        let realPreis =
            marktpreis +
            kostenStrombeschaffung +
            netznutzungsentgelt +
            messstellenbetrieb +
            (marktpreis * umsatzsteuer) / 100 +
            (marktpreis * stromsteuer) / 100 +    
            konzessionsabgabe +
            umlageKWKG +
            umlageStromNEV +
            offshoreNetzumlage +
            umlageAbschaltbareLasten;
    
        return realPreis;
    }
    
  
    
    module.exports = simulateEnergyManagement;