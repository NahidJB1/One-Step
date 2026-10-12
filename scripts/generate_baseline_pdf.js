const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const imgPath = 'C:/Users/User/.gemini/antigravity/brain/ebb837db-64e1-4a99-9c64-17dcdfa3245e/.user_uploaded/media_1789379089797.png';
  let imgSrc = '';
  try {
      const imgBase64 = fs.readFileSync(imgPath).toString('base64');
      imgSrc = `data:image/png;base64,${imgBase64}`;
  } catch (e) {
      console.error("Could not load image: " + e.message);
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 20px; color: #334155; }
h1, h2 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px; }
h1 { color: #0057ad; }
table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
th { background-color: #f1f5f9; font-weight: 600; color: #334155; }
tr:nth-child(even) { background-color: #f8fafc; }
.summary { display: flex; justify-content: space-between; margin-bottom: 30px; margin-top: 20px; gap: 15px; }
.box { padding: 20px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; text-align: center; flex: 1; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.box h3 { margin: 0 0 8px; font-size: 13px; color: #64748b; text-transform: uppercase; border: none; padding: 0; }
.box p { margin: 0; font-size: 28px; font-weight: bold; color: #0f172a; }
img { max-width: 100%; height: auto; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 15px; }
.page-break { page-break-before: always; }
.note { font-size: 12px; color: #64748b; font-style: italic; }
</style>
</head>
<body>
<h1>One-Step SEO Baseline Report</h1>
<p><strong>Period:</strong> August 15, 2026 &ndash; September 11, 2026 (Last 28 Days)</p>
<p><strong>Generated on:</strong> September 14, 2026</p>
<p><em>This baseline captures search performance and indexing status prior to deploying the new SEO optimizations. Compare these metrics against the next 28-day period.</em></p>

<div class="summary">
  <div class="box"><h3>Total Clicks</h3><p>193</p></div>
  <div class="box"><h3>Impressions</h3><p>13,368</p></div>
  <div class="box"><h3>Average CTR</h3><p>1.44%</p></div>
  <div class="box"><h3>Avg Position</h3><p>12.8</p></div>
</div>

<h2>Performance by Country</h2>
<table>
<thead><tr><th>Country</th><th>Clicks</th><th>Impressions</th><th>CTR</th><th>Position</th></tr></thead>
<tbody>
<tr><td>Malaysia</td><td>66</td><td>2,490</td><td>2.7%</td><td>15.2</td></tr>
<tr><td>Bangladesh</td><td>36</td><td>1,814</td><td>2.0%</td><td>9.4</td></tr>
<tr><td>Pakistan</td><td>13</td><td>940</td><td>1.4%</td><td>7.1</td></tr>
<tr><td>India</td><td>11</td><td>630</td><td>1.7%</td><td>20.0</td></tr>
<tr><td>Saudi Arabia</td><td>7</td><td>444</td><td>1.6%</td><td>11.6</td></tr>
<tr><td>Turkmenistan</td><td>6</td><td>51</td><td>11.8%</td><td>6.3</td></tr>
<tr><td>Indonesia</td><td>5</td><td>521</td><td>1.0%</td><td>13.2</td></tr>
<tr><td>Myanmar (Burma)</td><td>5</td><td>218</td><td>2.3%</td><td>6.6</td></tr>
<tr><td>Singapore</td><td>5</td><td>164</td><td>3.0%</td><td>13.6</td></tr>
<tr><td>Uzbekistan</td><td>3</td><td>84</td><td>3.6%</td><td>5.2</td></tr>
</tbody>
</table>

<h2>Top Queries</h2>
<table>
<thead><tr><th>Query</th><th>Clicks</th><th>Impressions</th><th>CTR</th><th>Position</th></tr></thead>
<tbody>
<tr><td>alfa university college fees</td><td>12</td><td>173</td><td>6.9%</td><td>3.3</td></tr>
<tr><td>alfa university college fees per semester</td><td>4</td><td>48</td><td>8.3%</td><td>3.3</td></tr>
<tr><td>alfa university college tuition fees for international students</td><td>3</td><td>32</td><td>9.4%</td><td>3.1</td></tr>
<tr><td>icms malaysia ranking</td><td>3</td><td>17</td><td>17.6%</td><td>2.9</td></tr>
<tr><td>segi university tuition fees for international students pdf</td><td>2</td><td>16</td><td>12.5%</td><td>7.1</td></tr>
<tr><td>taylor university tuition fees for international students</td><td>1</td><td>94</td><td>1.1%</td><td>7.6</td></tr>
<tr><td>taylors university fees</td><td>1</td><td>37</td><td>2.7%</td><td>10.1</td></tr>
<tr><td>brickfields asia college ranking</td><td>1</td><td>19</td><td>5.3%</td><td>6.7</td></tr>
<tr><td>alfa university malaysia tuition fees</td><td>1</td><td>17</td><td>5.9%</td><td>3.1</td></tr>
<tr><td>taylor university pharmacy fees</td><td>1</td><td>15</td><td>6.7%</td><td>5.7</td></tr>
<tr><td>alfa university fee structure</td><td>1</td><td>10</td><td>10.0%</td><td>1.9</td></tr>
<tr><td>taylors university tuition fee</td><td>1</td><td>8</td><td>12.5%</td><td>6.3</td></tr>
<tr><td>cheapest university in malaysia kuala lumpur</td><td>1</td><td>8</td><td>12.5%</td><td>7.5</td></tr>
<tr><td>cheapest university in kuala lumpur for international students</td><td>1</td><td>7</td><td>14.3%</td><td>8.0</td></tr>
<tr><td>help university tuition fees</td><td>1</td><td>7</td><td>14.3%</td><td>8.6</td></tr>
<tr><td>taylor's university fees undergraduate</td><td>1</td><td>5</td><td>20.0%</td><td>7.0</td></tr>
<tr><td>taylors university price</td><td>1</td><td>4</td><td>25.0%</td><td>7.0</td></tr>
<tr><td>unirazak phd fees</td><td>1</td><td>4</td><td>25.0%</td><td>8.3</td></tr>
<tr><td>ucmi university</td><td>1</td><td>4</td><td>25.0%</td><td>11.8</td></tr>
<tr><td>segi university architecture fees</td><td>1</td><td>3</td><td>33.3%</td><td>7.0</td></tr>
<tr><td>what is the tot</td><td>1</td><td>1</td><td>100.0%</td><td>4.0</td></tr>
</tbody>
</table>

<div class="page-break"></div>

<h2>Top Pages</h2>
<table>
<thead><tr><th>Page URL</th><th>Clicks</th><th>Impressions</th><th>CTR</th><th>Position</th></tr></thead>
<tbody>
<tr><td>/Fees_Chart/alfa-fees</td><td>59</td><td>1,545</td><td>3.8%</td><td>5.0</td></tr>
<tr><td>/ (Homepage)</td><td>30</td><td>80</td><td>37.5%</td><td>7.6</td></tr>
<tr><td>/Fees_Chart/taylors-fees</td><td>19</td><td>3,249</td><td>0.6%</td><td>6.8</td></tr>
<tr><td>/Fees_Chart/segi-fees</td><td>19</td><td>442</td><td>4.3%</td><td>8.9</td></tr>
<tr><td>/Fees_Chart/ucsi-fees</td><td>9</td><td>611</td><td>1.5%</td><td>8.4</td></tr>
<tr><td>/Fees_Chart/unikl-fees</td><td>8</td><td>397</td><td>2.0%</td><td>8.1</td></tr>
<tr><td>/Articles/cheapest-universities</td><td>5</td><td>198</td><td>2.5%</td><td>11.4</td></tr>
<tr><td>/Fees_Chart/unirazak-fees</td><td>4</td><td>304</td><td>1.3%</td><td>6.8</td></tr>
<tr><td>/Fees_Chart/utem-fees</td><td>4</td><td>187</td><td>2.1%</td><td>8.4</td></tr>
<tr><td>/Fees_Chart/amu-fees</td><td>4</td><td>166</td><td>2.4%</td><td>6.9</td></tr>
<tr><td>/Fees_Chart/help-fees</td><td>3</td><td>149</td><td>2.0%</td><td>8.0</td></tr>
<tr><td>/Fees_Chart/limkokwing-fees</td><td>4</td><td>387</td><td>1.0%</td><td>8.4</td></tr>
<tr><td>/Articles/study-medicine-mbbs-malaysia</td><td>2</td><td>257</td><td>0.8%</td><td>9.5</td></tr>
<tr><td>/Fees_Chart/bac-fees</td><td>2</td><td>193</td><td>1.0%</td><td>8.4</td></tr>
<tr><td>/Fees_Chart/icms-fees</td><td>2</td><td>120</td><td>1.7%</td><td>10.5</td></tr>
<tr><td>/Fees_Chart/cityu-fees</td><td>2</td><td>105</td><td>1.9%</td><td>7.5</td></tr>
<tr><td>/Universities/icms-details</td><td>2</td><td>70</td><td>2.9%</td><td>8.5</td></tr>
<tr><td>/Fees_Chart/utm-fees</td><td>1</td><td>208</td><td>0.5%</td><td>8.7</td></tr>
<tr><td>/Universities/bac-details</td><td>1</td><td>190</td><td>0.5%</td><td>12.0</td></tr>
<tr><td>/Articles/best-engineering-universities-malaysia</td><td>1</td><td>158</td><td>0.6%</td><td>20.9</td></tr>
<tr><td>/Articles/affordable-countries</td><td>1</td><td>142</td><td>0.7%</td><td>27.8</td></tr>
</tbody>
</table>
<p class="note">* Note: Non-www and .html URLs have been merged into their canonical paths in this report for clarity.</p>

<h2>Indexing Exclusions (Baseline)</h2>
<p>The screenshot below captures the current pages that are not indexed. Future deployments should see a reduction in the "Page with redirect", "Not found (404)", and "Alternate page with proper canonical tag" issues as the updated sitemap and clean HTML are crawled.</p>
<img src="${imgSrc}" alt="Indexing Status" />
</body>
</html>
  `;
  
  await page.setContent(html);
  await page.pdf({ 
    path: 'C:/Users/User/Desktop/One-Step_SEO_Baseline_Report_Sept2026.pdf', 
    format: 'A4',
    margin: { top: '30px', right: '30px', bottom: '30px', left: '30px' },
    printBackground: true
  });
  
  await browser.close();
})();
