/**
 * Fetches real-time exchange rates directly from Wise (wise.com/rates/live)
 * Generates wise-rates.json for zero-CORS client-side consumption
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const targets = [
  'EUR', 'GBP', 'RUB', 'KZT', 'TRY', 'CNY', 'AED', 
  'JPY', 'CHF', 'CAD', 'AUD', 'UAH', 'PLN', 'BRL', 'INR'
];

function fetchWiseRate(source, target) {
  return new Promise((resolve, reject) => {
    const url = `https://wise.com/rates/live?source=${source}&target=${target}`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching live mid-market rates from wise.com...');
  const rates = {
    USD: 1.0,
  };
  const rawWise = {};

  for (const t of targets) {
    try {
      const res = await fetchWiseRate('USD', t);
      if (res && typeof res.value === 'number') {
        rawWise[t] = {
          rate: res.value,
          time: res.time
        };
        // 1 USD = res.value Target
        // Therefore, 1 Target = (1 / res.value) USD
        rates[t] = 1 / res.value;
        console.log(`✓ Wise rate USD -> ${t}: ${res.value}`);
      }
    } catch (e) {
      console.warn(`Failed fetching Wise rate for ${t}:`, e.message);
    }
  }

  const output = {
    source: 'https://wise.com/ru/currency-converter/',
    provider: 'Wise (TransferWise) Mid-Market Live Rates',
    lastUpdated: new Date().toISOString(),
    timestamp: Date.now(),
    base: 'USD',
    wiseValues: rawWise, // 1 USD in target currency
    ratesInUSD: rates     // 1 target currency in USD
  };

  const outputPath = path.join(__dirname, 'wise-rates.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Successfully saved ${Object.keys(rawWise).length} Wise rates to ${outputPath}`);
}

main().catch(console.error);
