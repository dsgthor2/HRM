const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login');
  
  // Choose Admin Portal if not already selected
  await page.click('button:has-text("ADMIN")').catch(() => {});
  
  // Fill email
  await page.type('input[placeholder="admin@defenseblu.com"]', 'admin@defenseblu.com');
  await page.click('button:has-text("Continue")');
  
  // Fill password
  await page.waitForSelector('input[placeholder="••••••••••••"]');
  await page.type('input[placeholder="••••••••••••"]', 'SuperAdmin@123');
  await page.click('button:has-text("Sign In to DefenseBlu")');
  
  await page.waitForNavigation({waitUntil: 'networkidle0'});
  console.log("Redirected to:", page.url());
  await browser.close();
})();
