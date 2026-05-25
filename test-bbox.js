import https from 'https';

// Bounding box for the whole of Beijing (roughly 50km x 50km)
const north = 40.0;
const west = 116.2;
const south = 39.8;
const east = 116.5;

const url = `https://zh.wikipedia.org/w/api.php?action=query&list=geosearch&gsbbox=${north}|${west}|${south}|${east}&gslimit=100&format=json`;

const req = https.get(url, { headers: { 'User-Agent': 'TerraChronos/1.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(JSON.stringify(JSON.parse(data), null, 2));
  });
});
