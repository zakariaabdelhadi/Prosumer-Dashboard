const routes1_module = require('./WetterApiRoutes')
const prom_client = require('prom-client')

const LOGER_PREFIX = "EMS-2: " ;
const _30_cent = 25; 

const register = routes1_module.wetter_register;

const batterieStandGauge = new prom_client.Gauge({
    name: 'batterie_stand_metric_s2', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
  const gekaufterStromCounter = new prom_client.Gauge({
    name: 'gekaufter_strom_metric_s2', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
  const ausgabeStromCounter = new prom_client.Gauge({
    name: 'ausgabe_strom_metric_s2', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
  const eingespeisterStromCounter = new prom_client.Gauge({
    name: 'eingespeister_strom_metric_s2', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
  const earnStromCounter = new prom_client.Gauge({
    name: 'earning_strom_metric_s2', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });

 // let auto = 0;
  const batteryCapacity = 8; // Beispielkapazität in kWh
  let batterySOC = 0.0; // Beispiel-Startladestand der Batterie in kWh
  let gekaufterStrom = 0;
  let eingespeisterStrom = 0;
  let Batterie_effizience = 0.7;


 
function simulateEnergyManagement(generatedPower, householdLoad, electricityPrice) { // Preis im cent
  
  
  gekaufterStrom = 0;
  eingespeisterStrom = 0;
  
  stromPreisGauge.set(electricityPrice); //preis pro kWh in cent

        // was die Solaranlage momentan nicht leistet - nicht bedeckt
        const netLoad = householdLoad - generatedPower;
        // Berechne den Überschuss oder das Defizit
        const surplus = generatedPower - householdLoad;
        // Entscheidung basierend auf Überschuss/Defizit und Batterieladestand

  
        if (surplus > 0 && batterySOC < batteryCapacity && electricityPrice < _30_cent) { // Batterie laden
            console.log(LOGER_PREFIX +"Action : Batterie laden")
            const chargeAmount = surplus * Batterie_effizience;
            batterySOC += chargeAmount;
        } else if(surplus > 0 && batterySOC > (batteryCapacity - 3)  && electricityPrice > _30_cent){ // Strom ins Netz einspeisen
            console.log(LOGER_PREFIX +"Action : Strom ins Netz einspeisen")
            eingespeisterStrom =surplus;
        }else if (surplus > 0){
          console.log(LOGER_PREFIX + "Action : nichts machen trotz Überschuss")
        }
        
        
        if (surplus < 0 && batterySOC > 0 && netLoad > 0 ) { // Strom aus der Batterie nutzen
            console.log(LOGER_PREFIX +"Action : Strom aus der Batterie nutzen")
            const dischargeAmount = netLoad * Batterie_effizience;
            if(dischargeAmount > batterySOC){
                console.log(LOGER_PREFIX +"Action : strom aus dem Netz beziehen")
                gekaufterStrom = dischargeAmount - batterySOC ;
                batterySOC = 0;
            }else{
                batterySOC -= dischargeAmount;
            }
        }else if (surplus < 0 && batterySOC == 0 ){ // strom aus dem Netz
            console.log(LOGER_PREFIX +"Action : strom aus dem Netz beziehen")
            gekaufterStrom = netLoad;
        }

        batterieStandGauge.set(batterySOC);
        gekaufterStromCounter.set(gekaufterStrom);
        ausgabeStromCounter.set(gekaufterStrom*electricityPrice)
        eingespeisterStromCounter.set(eingespeisterStrom);
        earnStromCounter.set(eingespeisterStrom*electricityPrice)

    }



   

      function getGesamtPreis(marktpreis) {
        // Annahme: Alle Werte sind in Cent
    
        // Kosten für die Strombeschaffung, Vertrieb und Gewinnmarge (Beispielwert)
        let kostenStrombeschaffung = 8.54;
    
        // Steuern: Umsatzsteuer und Stromsteuer (Beispielwerte)
        let umsatzsteuer = 11; // 19%
        let stromsteuer = 2; // 2 Cent pro kWh
    
        // Netznutzungsentgelt inklusive Abrechnung (Beispielwert)
        let netznutzungsentgelt = 5.12;
    
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