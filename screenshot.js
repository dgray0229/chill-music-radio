const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:8084');
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: 'mobile.png', fullPage: true });
  await browser.close();
})();
