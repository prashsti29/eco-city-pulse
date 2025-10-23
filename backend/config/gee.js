const ee = require('@google/earthengine');
const key = require('../geospatial-webapp-f9a8007d4bed.json');

let isInitialized = false;

const initializeGEE = () => {
  return new Promise((resolve, reject) => {
    if (isInitialized) {
      resolve();
      return;
    }

    // const privateKey = process.env.GEE_PRIVATE_KEY.replace(/\\n/g, '\n');
    // console.log(ee.data) 
    // const privateKey=  process.env.GEE_PRIVATE_KEY//.split(String.raw`\n`).join('\n')
    const privateKey = key.private_key;

    ee.data.authenticateViaPrivateKey(
      {
        client_email: process.env.GEE_CLIENT_EMAIL,
        private_key: privateKey
      },
      () => {
        ee.initialize(null, null, () => {
          isInitialized = true;
          console.log('✓ GEE initialized');
          resolve();
        }, reject);
      },
      reject
    );
  });
};

module.exports = { initializeGEE, ee };