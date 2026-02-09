import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/ci-v3-full.png' });

await page.evaluate(() => {
  const vf = document.querySelector('.vue-flow__viewport');
  if (vf) vf.style.transform = 'translate(100px, 50px) scale(1.3)';
});
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/ci-v3-top.png' });

await page.evaluate(() => {
  const vf = document.querySelector('.vue-flow__viewport');
  if (vf) vf.style.transform = 'translate(-200px, -400px) scale(1.3)';
});
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/ci-v3-bottom.png' });

await browser.close();
console.log('done');
