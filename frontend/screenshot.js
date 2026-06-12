const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to mobile
  await page.setViewport({
    width: 360,
    height: 740,
    isMobile: true,
    hasTouch: true
  });

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  
  // Fill login
  await page.type('input[name="email"]', 'admin@defenseblu.com');
  await page.type('input[name="password"]', 'defenseblu@123');
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  
  // Take screenshot
  await page.screenshot({ path: 'C:/Users/dheel/.gemini/antigravity/brain/ccf78b8a-be69-4a0b-8805-dbd73091b499/local_dashboard.png' });
  
  await browser.close();
  console.log("Screenshot saved!");
})();
