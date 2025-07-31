const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Directory where CSV files are located
const dataDir = path.join(__dirname, '..', 'data', 'FBT');

/**
 * Reads and parses all CSV files in the specified directory.
 * Automatically normalizes the date column to 'Datetime'
 * (handles cases where it's named 'Date' instead).
 * 
 * @returns {Promise<Array>} Array of objects: { filename, data[] }
 */
function readAllCSVFiles() {
  return new Promise((resolve, reject) => {
    fs.readdir(dataDir, (err, files) => {
      if (err) return reject(err);

      // Filter only CSV files
      const csvFiles = files.filter(file => file.endsWith('.csv'));
      const result = [];
      let filesProcessed = 0;

      if (csvFiles.length === 0) return resolve([]);

      csvFiles.forEach(file => {
        const filePath = path.join(dataDir, file);
        const rows = [];

        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => rows.push(data))
          .on('end', () => {
            // Normalize column keys: ensure date column is always 'Datetime'
            const normalizedRows = rows.map(row => {
              const keys = Object.keys(row);
              const dateKey = keys.find(k => k.toLowerCase().includes('date'));

              // If found a key like 'Date' or 'DATE', rename it to 'Datetime'
              if (dateKey && dateKey !== 'Datetime') {
                row['Datetime'] = row[dateKey];
                delete row[dateKey];
              }

              return row;
            });

            // Push parsed file result
            result.push({
              filename: file,
              data: normalizedRows
            });

            filesProcessed++;
            if (filesProcessed === csvFiles.length) {
              resolve(result);
            }
          })
          .on('error', reject);
      });
    });
  });
}

module.exports = {
  readAllCSVFiles,
};
