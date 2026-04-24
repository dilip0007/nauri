const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

(async () => {
    console.log('Starting Naukri Profile Updater...');
    const email = process.env.NAUKRI_EMAIL;
    const password = process.env.NAUKRI_PASSWORD;

    if (!email || !password) {
        console.error('Missing NAUKRI_EMAIL or NAUKRI_PASSWORD environment variables.');
        process.exit(1);
    }

    // In GitHub Actions, it's best to run headed via xvfb-run if headless gets blocked.
    // We'll configure it to run headless normally, but you can change it if blocked.
    const isHeadless = process.env.HEADLESS !== 'false';
    const browser = await chromium.launch({
        headless: isHeadless,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();

    try {
        console.log('Navigating to login page...');
        await page.goto('https://www.naukri.com/nlogin/login', { waitUntil: 'domcontentloaded', timeout: 60000 });

        console.log('Waiting for login form...');
        await page.waitForSelector('#usernameField', { timeout: 30000 });

        console.log('Entering credentials...');
        await page.fill('#usernameField', email);
        await page.fill('#passwordField', password);

        console.log('Submitting login...');
        await page.click('button[type="submit"]');

        console.log('Waiting for navigation after login...');
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => console.log('Navigation wait timed out, continuing...'));

        // Add a delay to let the dashboard fully render
        await page.waitForTimeout(5000);

        console.log('Navigating to profile page...');
        await page.goto('https://www.naukri.com/mnjuser/profile', { waitUntil: 'domcontentloaded', timeout: 60000 });

        console.log('Waiting for Resume Headline edit icon...');
        // Selector from the successful agent execution
        await page.waitForSelector('.resumeHeadline .edit', { timeout: 30000 });
        console.log('Clicking edit icon...');
        await page.click('.resumeHeadline .edit');

        console.log('Editing headline...');
        await page.waitForSelector('#resumeHeadlineTxt', { timeout: 30000 });
        const currentHeadline = await page.inputValue('#resumeHeadlineTxt');

        // We append a dot if it doesn't have one, or remove it if it has it, to always make a diff.
        // Or simply add a space. Sometimes spaces are trimmed, so we'll just rewrite the same plus a small invisible change or just click save.
        // Clicking save without change also triggers an update. Let's just click save!
        // To be safe, we add a space at the end. 
        if (currentHeadline.endsWith(' ')) {
            await page.fill('#resumeHeadlineTxt', currentHeadline.trim());
        } else {
            await page.fill('#resumeHeadlineTxt', currentHeadline + ' ');
        }

        console.log('Saving headline...');
        // Match a visible "Save" button
        await page.locator('button').filter({ hasText: 'Save' }).filter({ visible: true }).first().click();

        // Wait for the modal to close or save message
        await page.waitForTimeout(5000);

        console.log('Profile successfully updated!');
    } catch (err) {
        console.error('An error occurred:', err);
        await page.screenshot({ path: 'error.png', fullPage: true }).catch(() => { });
    } finally {
        await browser.close();
    }
})();
