const https = require('https');
https.get('https://hrm-defenseblu.pages.dev/login', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // NextJS uses bundled js, so we look for JS bundles in the HTML
    const jsBundles = data.match(/src="(\/_next\/static\/chunks\/pages\/login-[^"]+)"/g) || [];
    console.log("Found login bundles:", jsBundles);
  });
});
