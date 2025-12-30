
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // A4 size at 300 DPI is 2480 x 3508 pixels
    const width = 2480;
    const height = 3508;

    await page.setViewportSize({ width, height });

    const flyerPath = path.join(process.cwd(), 'public', 'marketing', 'flyer.html');

    // Ensure the file exists
    if (!fs.existsSync(flyerPath)) {
        console.error(`File not found: ${flyerPath}`);
        process.exit(1);
    }

    // Use file:// protocol
    const fileUrl = `file://${flyerPath.replace(/\\/g, '/')}`;
    console.log(`Navigating to: ${fileUrl}`);

    await page.goto(fileUrl);

    // Wait for network idle to ensure images (logo, bg, qr) are loaded
    await page.waitForLoadState('networkidle');

    // Additional wait for any fonts or rendering
    await page.waitForTimeout(1000);

    const outputPath = path.join(process.cwd(), 'public', 'marketing', 'flyer.png');

    await page.screenshot({ path: outputPath, fullPage: true });

    await browser.close();
    console.log(`Flyer saved to ${outputPath}`);
})();
