/*



Verstanden, wenn du eine einfache Simulation eines Energie-Management-Systems (EMS) erstellen möchtest, um die Grundprinzipien zu verstehen, kannst du das in Python mit grundlegenden Algorithmen und Modellen tun. Hier ist eine vereinfachte Schritt-für-Schritt-Anleitung für eine solche Simulation:

1. **Modellierung der Komponenten**: Definiere die grundlegenden Komponenten deines Systems, wie PV-Module, Batteriespeicher und Haushaltslasten. Du kannst einfache Modelle verwenden, um die Leistung und den Zustand jeder Komponente darzustellen.

2. **Datenfluss simulieren**: Simuliere den Datenfluss zwischen den Komponenten. Generiere beispielsweise zufällige PV-Erzeugungsprofile und Lastprofile für den Haushalt.

3. **Einfache Regelungslogik**: Implementiere eine einfache Regelungslogik. Zum Beispiel könntest du eine Regel erstellen, die sicherstellt, dass der überschüssige PV-Strom in die Batterie geladen wird, wenn die PV-Erzeugung hoch ist, und die Batterie entladen wird, wenn die Nachfrage im Haushalt hoch ist.

4. **Zeitsimulation**: Simuliere den Energiefluss über einen Zeitraum, z. B. über einen Tag. Aktualisiere die Zustände der Komponenten und berechne den Energiefluss basierend auf deiner Regelungslogik.

5. **Grafische Darstellung**: Nutze Python-Bibliotheken wie Matplotlib, um die simulierten Daten grafisch darzustellen. Du könntest beispielsweise Diagramme erstellen, die die PV-Erzeugung, den Batteriestand und den Haushaltsverbrauch im Laufe des Tages zeigen.

Hier ist ein einfaches Beispiel in Pseudocode, um den Ansatz zu veranschaulichen:


Denke daran, dass dies nur eine sehr einfache Simulation ist, die grundlegende Prinzipien veranschaulicht. Für eine realistischere Simulation müsstest du detailliertere Modelle für die Komponenten, komplexere Regelungsstrategien und realistischere Daten verwenden.










*/


function generateRandomProfile(length, maxValue) {
    return Array.from({ length }, () => Math.random() * maxValue);
}

const pvGeneration = generateRandomProfile(24, 5); // Beispielhafte PV-Erzeugung in kW
const householdLoad = generateRandomProfile(24, 4); // Beispielhafte Haushaltslast in kW

const batteryCapacity = 10; // Beispielkapazität in kWh
let batterySOC = 0.5; // Beispiel-Startladestand der Batterie

for (let hour = 0; hour < 24; hour++) {
    const pvPower = pvGeneration[hour];
    const load = householdLoad[hour];

    // Berechne den Überschuss oder das Defizit
    const surplus = pvPower - load;

    // Lade die Batterie, wenn Überschuss vorhanden ist
    if (surplus > 0) {
        const chargeAmount = Math.min(surplus, batteryCapacity * (1 - batterySOC));
        batterySOC += chargeAmount / batteryCapacity;
    }

    // Entlade die Batterie, um den Verbrauch zu decken
    else {
        const dischargeAmount = Math.min(-surplus, batteryCapacity * batterySOC);
        batterySOC -= dischargeAmount / batteryCapacity;
    }

    // Energiebilanz im Haushalt
    const netLoad = load - pvPower + dischargeAmount - chargeAmount;

    console.log(`Hour ${hour}: PV Power = ${pvPower}, Load = ${load}, Battery SOC = ${batterySOC}, Net Load = ${netLoad}`);
}



//-----------------------------------------------------------------


function simulateEnergyManagement(solarRadiation, generatedPower, temperature, windSpeed, householdLoad, electricityPrice) {
    const batteryCapacity = 10; // Beispielkapazität in kWh
    let batterySOC = 0.5; // Beispiel-Startladestand der Batterie

    for (let hour = 0; hour < 24; hour++) {
        const pvPower = solarRadiation[hour] * generatedPower; // Beispielhafte Berechnung der PV-Leistung
        const load = householdLoad[hour];
        const netLoad = load - pvPower;

        // Berechne den Überschuss oder das Defizit
        const surplus = pvPower - load;

        // Entscheidung basierend auf Überschuss/Defizit und Batterieladestand
        if (surplus > 0 && batterySOC < 1) {
            const chargeAmount = Math.min(surplus, batteryCapacity * (1 - batterySOC));
            batterySOC += chargeAmount / batteryCapacity;
        } else if (surplus < 0 && batterySOC > 0 && netLoad > 0) {
            const dischargeAmount = Math.min(-surplus, batteryCapacity * batterySOC, netLoad);
            batterySOC -= dischargeAmount / batteryCapacity;
        }

        // Entscheidung basierend auf Strompreis und Netto-Last
        let action = '';
        if (netLoad > 0 && electricityPrice[hour] < 0.3) {
            action = 'Strom einspeisen';
        } else if (netLoad < 0 && electricityPrice[hour] > 0.5) {
            action = 'Batterie entladen';
        } else {
            action = 'Haushalt versorgen';
        }

        console.log(`Hour ${hour}: PV Power = ${pvPower.toFixed(2)}, Load = ${load}, Battery SOC = ${batterySOC.toFixed(2)}, Net Load = ${netLoad.toFixed(2)}, Action: ${action}`);
    }
}

// Beispielhafte Daten (Bitte mit echten Daten ersetzen)
const solarRadiation = [0.3, 0.5, 0.7, /* ... */, 0.4]; // Beispielhafte Sonnenstrahlungsdaten
const generatedPower = 5; // Beispielhafte Leistung der PV-Anlage in kW
const temperature = [20, 22, 25, /* ... */, 18]; // Beispielhafte Temperaturdaten
const windSpeed = [3, 4, 5, /* ... */, 2]; // Beispielhafte Windgeschwindigkeitsdaten
const householdLoad = [2, 2.5, 3, /* ... */, 2.2]; // Beispielhafter Haushaltsverbrauch in kW
const electricityPrice = [0.25, 0.22, 0.28, /* ... */, 0.30]; // Beispielhafte Strompreisdaten

simulateEnergyManagement(solarRadiation, generatedPower, temperature, windSpeed, householdLoad, electricityPrice);
