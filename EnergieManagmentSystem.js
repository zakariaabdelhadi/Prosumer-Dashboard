const routes1_module = require('./WetterApiRoutes')
const prom_client = require('prom-client')

const LOGER_PREFIX = "EMS-1: " ;
const _20_cent = 20; 

const register = routes1_module.wetter_register;

const stromPreisGauge = new prom_client.Gauge({
  name: 'strom_preis_metric', // The name of the metric
  help: 'gauge metric', // Help text describing the metric
//   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
  registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
});
const stromLocalPreisGauge = new prom_client.Gauge({
  name: 'strom_local_preis_metric', // The name of the metric
  help: 'gauge metric', // Help text describing the metric
//   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
  registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
});
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
  const gekaufterStromCounter = new prom_client.Gauge({
    name: 'gekaufter_strom_metric', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
  const ausgabeStromCounter = new prom_client.Gauge({
    name: 'ausgabe_strom_metric', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
  const eingespeisterStromCounter = new prom_client.Gauge({
    name: 'eingespeister_strom_metric', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
  const earnStromCounter = new prom_client.Gauge({
    name: 'earning_strom_metric', // The name of the metric
    help: 'gauge metric', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });

  const GewinnCounter = new prom_client.Gauge({
    name: 'gewinn_metric', // The name of the metric
    help: 'Gauge metric - gewinn minus ausgabe', // Help text describing the metric
 //   labelNames: ['label1', 'label2'], // (Optional) Specify label names if your metric requires labels
    registers: [register], // (Optional) Register the metric with the custom registry (default is the default registry)
  });
  
 // let auto = 0;
  const batteryCapacity = 3; // Beispielkapazität in kWh
  let batterySOC = 0.0; // Beispiel-Startladestand der Batterie in kWh
  let gekaufterStrom = 0;
  let eingespeisterStrom = 0;
  let Batterie_effizience = 0.5;

  let Gewinn = 0;



  
function simulateEnergyManagement(generatedPower, householdLoad, electricityPrice) { // Preis im cent

        gekaufterStrom = 0;
        eingespeisterStrom = 0;

        stromPreisGauge.set(electricityPrice); //preis pro kWh in cent
 
        // was die Solaranlage momentan nicht leistet - nicht bedeckt
        let netLoad = householdLoad - generatedPower;
        // Berechne den Überschuss oder das Defizit
        let surplus = generatedPower - householdLoad;

        ueberschussGauge.set(surplus);
        // Entscheidung basierend auf Überschuss/Defizit und Batterieladestand

  
        if (surplus > 0 && batterySOC < batteryCapacity ) { // Batterie laden
          console.log(LOGER_PREFIX + "Action : Batterie laden")
          const chargeAmount = surplus * Batterie_effizience;
          batterySOC += chargeAmount;
          if(batterySOC > batteryCapacity ) {batterySOC = batteryCapacity}
      } else if(surplus > 0 && electricityPrice > _20_cent){ // Strom ins Netz einspeisen
          console.log(LOGER_PREFIX + "Action : Strom ins Netz einspeisen")
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
              netLoad = netLoad - gekaufterStrom;
              batterySOC = 0;
          }else{
              batterySOC -= dischargeAmount;
          }
      }
      
      
      if (surplus < 0 && batterySOC == 0 && netLoad > 0 ){ // strom aus dem Netz
          console.log(LOGER_PREFIX +"Action : strom aus dem Netz beziehen")
          gekaufterStrom += netLoad;
      }

        batterieStandGauge.set(batterySOC);
        gekaufterStromCounter.set(gekaufterStrom);
        ausgabeStromCounter.set(gekaufterStrom*electricityPrice) 
        eingespeisterStromCounter.set(eingespeisterStrom);
        earnStromCounter.set(eingespeisterStrom*electricityPrice)

        Gewinn += eingespeisterStrom*electricityPrice;
        Gewinn -= gekaufterStrom*electricityPrice;

        GewinnCounter.set(Gewinn);

    }



   

    
    
  
    
    module.exports = simulateEnergyManagement;