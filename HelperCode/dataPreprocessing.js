const fs = require('fs');
const readline = require('readline')

const csvFilePath = 'daten/output.csv';

function abschneiden(){

let value = '';

let count = 0;
    
    const readStream = fs.createReadStream('daten/household_power_consumption.csv', 'utf-8');
    let rl = readline.createInterface({ input: readStream });
    rl.on('line', (line) => {

         count++;


         if(count >= 21998 && count<=547598 ){

            value = value.concat(line).concat('\n');

         }
        



    });

    rl.on('close', () => {
        console.log('Data parsing completed');

    });

    readStream.on('error', (error) => console.log(error.message));
    readStream.on('data', (chunk) => {

        // console.log(chunk)
    });
    readStream.on('end', () => {

        console.log('Reading complete')
        writeToCSV(csvFilePath, value);




    });
    
    function writeToCSV(filePath, data) {
        fs.writeFile(filePath, data, 'utf8', (err) => {
          if (err) {
            console.error('Fehler beim Schreiben der CSV-Datei:', err);
          } 
        });
      }
}

abschneiden();