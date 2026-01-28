const { chromium } = require("@playwright/test");

class AuthPage {
  constructor() {
    this.token = null;
    this.userData = null;
  }

  // 1️⃣ Login through API
  // -----------------------------------------
  async loginByAPI(apiUrl, username, password) {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const response = await page.request.post(apiUrl, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      data: { username, password }
    });

    const respJson = await response.json();
    if (!respJson.success) throw new Error("Login failed: " + JSON.stringify(respJson));

    this.token = respJson.data.token;
    this.userData = {
      userName: respJson.data.userName,
      roles: respJson.data.roles
    };

    await browser.close();
  }

  // 2️⃣ Create localStorage values
  // -----------------------------------------
  async prepareLocalStorage(baseUrl) {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const userRecords = [
      {
        id: "inv-001",
        fullName: "NCRP Demo User",
        email: "demo@ncrp.gov",
        role: this.userData.roles[0] || "investigator",
        avatarColor: "#5B8DEF"
      }
    ];

    await page.goto(baseUrl);

    await page.evaluate((userRecords) => {
      localStorage.setItem("ncrp-auth-user-records", JSON.stringify(userRecords));
      localStorage.setItem("ncrp.sidebar.state", JSON.stringify({ collapsed: false }));
      localStorage.setItem("ncrp.theme", "dark");
    }, userRecords);

    await page.context().storageState({ path: "storageState.json" });

    console.log("✓ storageState.json created");

    await browser.close();
  }

  // 3️⃣ Prepare authenticated context with sessionStorage
  // -----------------------------------------
  async createAuthenticatedContext(browser) {
    const context = await browser.newContext({ storageState: "storageState.json" });

    const page = await context.newPage();

    await page.addInitScript(({ token, userData }) => {
      window.sessionStorage.setItem("authToken", token);
      window.sessionStorage.setItem("dashboardLoaded", "true");
      window.sessionStorage.setItem("userData", JSON.stringify(userData));
    }, { token: this.token, userData: this.userData });

    return { context, page };
  }
}

module.exports = { AuthPage };
