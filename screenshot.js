const playwright = require('playwright');
const fs = require('fs');
const assert = require('assert'); 
const times = 3;

// const browserTypes = ['chromium', 'firefox','webkit'];
const browserTypes = ['chromium'];
const browserArgs = [
    '--disable-gpu',
    '--no-sandbox',
    '--disable-web-security',
    '--disable-dev-profile'
];
// const breakpoints = [320, 480, 640, 768, 1024, 1400];
const viewpoints = [
    // { width: 360, height: 640 },	// Samsung Galaxy S7,Samsung Galaxy S7 Edge
    { width: 360, height: 740 },	// Samsung Galaxy S9,Samsung Galaxy S9+,Samsung Galaxy S8,Samsung Galaxy S8+
    { width: 375, height: 812 },	// iPhone 11 Pro,iPhone 11 X,iPhone 11 Xs,iPhone X
    // { width: 375, height: 667 },	// iPhone SE
    // { width: 414, height: 736 },	// iPhone 8 Plus,iPhone 7 Plus,iPhone 6s Plus,iPhone 6 Plus
    // { width: 411, height: 731 },	// Nexus 6P,Nexus 5X,Google Pixel,Google Pixel XL,Google Pixel 2
    { width: 414, height: 896 },	// iPhone 11 Pro Max iPhone 11 Xs Max iPhone 11 iPhone 11 Xr 
    // { width: 480, height: 853 },	// Samsung Galaxy Note 5, LG G5, One Plus 3 
    // { width: 600, height: 960 },	// Nexus 7 (2013)
    { width: 768, height: 1024 },	// iPad Third & Fourth Generation iPad Air 1 & 2 iPad Mini iPad Mini 2 & 3 Nexus 9 
    // { width: 800, height: 1280 },	// Samsung Galaxy Tab 10
    { width: 1024, height: 1366 },	// iPad Pro
    // { width: 1280, height: 850 },	// Chromebook Pixel
    { width: 1400, height: 900 },	// Desktop
]
// const breakpoints = [480, 640, 768, 1024, 1400];
// const height = 900;
const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36";


let myArgs = process.argv.slice(2);

const takeScreenshot = async function (page, title, url, viewpoints, dir, browserType, state) {
    let filename = "";
    await page.goto(url, { waitUntil: 'networkidle' });
    for (let viewpoint of viewpoints) {
        await page.setViewportSize(viewpoint);
        filename = dir + state + '-' + title + '-' + browserType + '-' + viewpoint.width + '-' + viewpoint.height + '.png';
        await page.screenshot({ path: filename, fullPage: true });
        console.log(filename);
    }
    return filename;
}

const login = async function (page, loginUrl, redirectUrl, username, password) {
    await page.goto(loginUrl, { waitUntil: 'networkidle' });
    await page.fill('#login-form #email', username);
    await page.fill('#login-form #pass', password);
    await page.click('#login-form button#send2');
    if (await verifyIsLoggedIn(page, redirectUrl)) {
        return await page.context().cookies();
    } else {
        return false;
    }
}

const verifyIsLoggedIn = async (page, redirectUrl) => {
    await page.goto(redirectUrl, { waitUntil: 'networkidle' });
    const checkout = await page.evaluate(() => checkout);
    return checkout.customerLoggedIn;

}

if (myArgs.length > 0) {
    let projectName = myArgs[0];
    console.log(projectName);
    let jsonData = JSON.parse(fs.readFileSync("./projects/" + projectName + "/config.json"));
    let logoutPages = jsonData.logoutPages;
    let loginPages = jsonData.loginPages;
    let loginUrl = jsonData.loginUrl;
    let redirectUrl = jsonData.redirectUrl;
    let baseUrl = jsonData.baseUrl;
    let username = jsonData.username;
    let password = jsonData.password;
    
    let dir = "projects/" + projectName + "/screenshots/";
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    (async () => {
        for (let browserType of browserTypes) {
            let browser = await playwright[browserType].launch({
                args: browserArgs
                // , headless: false, slowMo: 250
            });
            let context = await browser.newContext({
                userAgent: userAgent
            });

            let page = await context.newPage();
            
            for (let p in logoutPages) {
                // continue;
                let tried = 0;
                for (tried = 0; tried < times; tried++) {
                    try {
                        await takeScreenshot(page, p, baseUrl + logoutPages[p], viewpoints, dir, browserType, 'logout');
                        tried = times;
                    } catch (err) {
                        console.log(err.message);
                        tried += 1;
                    }
                }
            }
            let cookies = await login(page, baseUrl + loginUrl, baseUrl + redirectUrl, username, password);
            // console.log(cookies);
            if (cookies) {
                for (let p in loginPages) {
                    let tried = 0;
                    for (tried = 0; tried < times; tried++) {
                        try {
                            await takeScreenshot(page, p, baseUrl + loginPages[p], viewpoints, dir, browserType, 'login');
                            tried = times;
                        } catch (err) {
                            console.log(err.message);
                            tried += 1;
                        }
                    }
                }
            } else {
                console.log("Login failed.")
            }
            await browser.close();
        }
    })();
}