const fs = require("fs");
const path = require("path");

const BASE_URL = "http://148.113.0.204:23810";
const TOKEN_FILE = path.join(__dirname, "../artifacts/tokens.json");

/**
 * UI Login + Token Capture (NO AuthPage usage)
 */
async function loginByUIAndSaveToken(browser, userType, user) {
    const context = await browser.newContext();
    const page = await context.newPage();

    const selectors = {
        username: 'input[formcontrolname="username"]',
        password: 'input[formcontrolname="password"]',
        submit: 'button[type="submit"]'
    };

    console.log(`--- UI login for ${userType} ---`);

    await page.goto(BASE_URL);

    await page.fill(selectors.username, user.username);
    await page.fill(selectors.password, user.password);

    // ✅ Wait explicitly for the auth API response
    const authResponsePromise = page.waitForResponse(response =>
        response.url().includes("/authentication/api/v1/user/authenticate") &&
        response.status() === 200
    );

    await page.click(selectors.submit);

    const authResponse = await authResponsePromise;
    const authJson = await authResponse.json();

    const token = authJson?.data?.token;
    if (!token) {
        throw new Error("Token not found in authentication API response");
    }

    saveToken(userType, token);

    // Optional but recommended: wait for dashboard readiness
    await page.waitForURL(/\/dashboard\//, { timeout: 15000 });

    return { context, page, token };
}


function saveToken(userType, token) {
    let data = {};

    if (fs.existsSync(TOKEN_FILE)) {
        data = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
    }

    data[userType] = token;

    fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(data, null, 2));

    console.log(`✓ Token saved for ${userType}`);
}

module.exports = { loginByUIAndSaveToken };
