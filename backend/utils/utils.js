const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const AWS = require('aws-sdk');

function truncateDecimal(number, digits) {
  const factor = Math.pow(10, digits);
  return Math.floor(number * factor) / factor;
}

async function readAllCSVFiles(dataDir) {
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

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

async function readAllCSVFilesFromS3(bucket, prefix) {
  // 1. List all CSV files in S3 prefix
  const listParams = {
    Bucket: bucket,
    Prefix: prefix,
  };
  const listResponse = await s3.listObjectsV2(listParams).promise();
  const csvFiles = (listResponse.Contents || [])
    .map(obj => obj.Key)
    .filter(key => key.endsWith('.csv'));

  if (csvFiles.length === 0) return [];

  // 2. Đọc và parse từng file CSV
  const results = [];

  for (const key of csvFiles) {
    const rows = [];

    // Lấy stream từ S3 file
    const s3Stream = s3.getObject({ Bucket: bucket, Key: key }).createReadStream();

    // Đọc file CSV từ stream
    await new Promise((resolve, reject) => {
      s3Stream
        .pipe(csv())
        .on('data', (data) => rows.push(data))
        .on('end', () => {
          // Chuẩn hóa key Datetime
          const normalizedRows = rows.map(row => {
            const keys = Object.keys(row);
            const dateKey = keys.find(k => k.toLowerCase().includes('date'));
            if (dateKey && dateKey !== 'Datetime') {
              row['Datetime'] = row[dateKey];
              delete row[dateKey];
            }
            return row;
          });

          results.push({ filename: key, data: normalizedRows });
          resolve();
        })
        .on('error', reject);
    });
  }
  return results;
}

module.exports = {
  truncateDecimal,
  readAllCSVFiles,
  readAllCSVFilesFromS3
};