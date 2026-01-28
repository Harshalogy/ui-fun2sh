// pageObjects/tokenHelper.page.js
// ===========================================
const fs = require("fs");
const path = require("path");
class TokenHelperPage {
    constructor(page, request) {
        this.page = page;
        this.request = request;
        this.capturedToken = null;
        this.caseManagementBaseURL = "http://148.113.0.204:9464/ncrp-casemanagement/api/v1/caseManagement";
        this.baseURL = "http://148.113.0.204:9464";
    }

    /**
 * Listen for Bearer token from API requests (minimal logging)
 */


    

    startTokenCapture() {
        console.log("Starting token capture for all API requests...");

        this.page.on("request", req => {
            const url = req.url();

            // Capture token from ANY request to your API server
            if (url.includes(this.baseURL)) {
                const auth = req.headers()["authorization"];
                if (auth && auth.startsWith("Bearer ")) {
                    // Only capture if we don't already have a token
                    if (!this.capturedToken) {
                        this.capturedToken = auth.replace("Bearer ", "");
                        console.log("Token Captured");
                        console.log(this.capturedToken);

 // ADD THESE TWO LINES ONLY
                    const fs = require("fs");
                    fs.writeFileSync("Token_Api.json", JSON.stringify({ token: this.capturedToken }, null, 2));
                    // --
                        

                    }
                }
            }
        });
    }

    /**
     * Extract clean API endpoint from URL
     */
    extractApiEndpoint(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname.split('/').slice(-3).join('/'); // Last 3 parts
        } catch {
            return url.split('/').slice(-3).join('/');
        }
    }

    /**
     * Get token with multiple fallback options
     */
    async getToken() {
        await this.page.waitForTimeout(1000);

        // Option 1: Use captured token
        if (this.capturedToken) {
            return this.capturedToken;
        }

        // Option 2: Try to extract from localStorage
        const storageToken = await this.extractTokenFromStorage();
        if (storageToken) {
            this.capturedToken = storageToken;
            return storageToken;
        }

        // Option 3: Use auth token if available (from your auth fixture)
        if (typeof global !== 'undefined' && global.auth && global.auth.token) {
            this.capturedToken = global.auth.token;
            return this.capturedToken;
        }

        throw new Error("Token not captured from API calls and not found in storage!");
    }

    /**
     * Try to extract token from browser storage
     */
    async extractTokenFromStorage() {
        try {
            // Try localStorage first
            const token = await this.page.evaluate(() => {
                // Common token storage keys
                const possibleKeys = [
                    'token',
                    'auth_token',
                    'access_token',
                    'accessToken',
                    'jwt_token',
                    'id_token',
                    'authToken',
                    'authorization'
                ];

                for (const key of possibleKeys) {
                    const value = localStorage.getItem(key);
                    if (value && value.startsWith('eyJ')) { // JWT tokens start with eyJ
                        return value;
                    }
                }

                // Try sessionStorage
                for (const key of possibleKeys) {
                    const value = sessionStorage.getItem(key);
                    if (value && value.startsWith('eyJ')) {
                        return value;
                    }
                }

                return null;
            });

            if (token) {
                console.log("Token extracted from browser storage");
                return token;
            }
        } catch (error) {
            console.log("Could not extract token from storage:", error.message);
        }

        return null;
    }

    //  API CALL METHODS (UPDATED WITH BETTER ERROR HANDLING)

    async callMoTimelineAPI() {
        const token = await this.getToken();

        const url = `${this.baseURL}/ncrpbase/api/v1/casedashboard/moTimeLineDetails`;

        const resp = await this.request.get(url, {
            headers: this.getCommonHeaders(token)
        });

        if (resp.status() !== 200) {
            throw new Error(`MO Timeline API failed with status ${resp.status()}`);
        }

        return await resp.json();
    }

    async callExitModeInsightAPI() {
        const token = await this.getToken();

        const url = `${this.baseURL}/ncrpbase/api/v1/exit-mode-insight/exit-chart-data-all?username=ncrp_demo`;

        const resp = await this.request.get(url, {
            headers: this.getCommonHeaders(token)
        });

        if (resp.status() !== 200) {
            throw new Error(`Exit Mode Insight API failed with status ${resp.status()}`);
        }

        return await resp.json();
    }

    /**
     * Common headers for all API requests
     */
    getCommonHeaders(token = null) {
        const authToken = token || this.capturedToken;
        if (!authToken) {
            throw new Error("No token available for API calls");
        }

        return {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9,en-IN;q=0.8',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
            'Origin': 'http://148.113.0.204:23810',
            'Referer': 'http://148.113.0.204:23810/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0'
        };
    }

    //  CASE MANAGEMENT API METHODS

    async getActiveCasesCount() {
        const token = await this.getToken();

        const url = `${this.caseManagementBaseURL}/active/count`;
        const resp = await this.request.get(url, {
            headers: this.getCommonHeaders(token)
        });

        if (resp.status() !== 200) {
            throw new Error(`Active cases API failed with status ${resp.status()}`);
        }

        const data = await resp.json();
        return this.extractCountFromResponse(data);
    }

    async getReopenedCasesCount() {
        const token = await this.getToken();

        const url = `${this.caseManagementBaseURL}/reopened/count`;
        const resp = await this.request.get(url, {
            headers: this.getCommonHeaders(token)
        });

        if (resp.status() !== 200) {
            throw new Error(`Reopened cases API failed with status ${resp.status()}`);
        }

        const data = await resp.json();
        return this.extractCountFromResponse(data);
    }

    async getClosedCasesCount() {
        const token = await this.getToken();

        const url = `${this.caseManagementBaseURL}/closed/count`;
        const resp = await this.request.get(url, {
            headers: this.getCommonHeaders(token)
        });

        if (resp.status() !== 200) {
            throw new Error(`Closed cases API failed with status ${resp.status()}`);
        }

        const data = await resp.json();
        return this.extractCountFromResponse(data);
    }

    async getTotalCasesCount() {
        const token = await this.getToken();

        const url = `${this.caseManagementBaseURL}/count`;
        const resp = await this.request.get(url, {
            headers: this.getCommonHeaders(token)
        });

        if (resp.status() !== 200) {
            throw new Error(`Total cases API failed with status ${resp.status()}`);
        }

        const data = await resp.json();
        return this.extractCountFromResponse(data);
    }

    /**
     * Extract count from various response formats
     */
    extractCountFromResponse(data) {
        if (typeof data === 'number') {
            return data;
        }

        if (typeof data === 'object' && data !== null) {
            // Try common count field names
            const possibleFields = ['count', 'total', 'value', 'cases', 'active', 'closed', 'totalCases'];

            for (const field of possibleFields) {
                if (data[field] !== undefined) {
                    const value = data[field];
                    return typeof value === 'number' ? value : parseInt(value) || 0;
                }
            }

            // If no known field, try first numeric value
            for (const value of Object.values(data)) {
                if (typeof value === 'number') {
                    return value;
                }
                const num = parseInt(value);
                if (!isNaN(num)) {
                    return num;
                }
            }
        }

        // If it's a string that's a number
        const num = parseInt(data);
        if (!isNaN(num)) {
            return num;
        }

        return 0;
    }

    /**
     * Get all case counts in a single object
     */
    async getAllCaseCounts() {
        const [active, reopened, closed, total] = await Promise.all([
            this.getActiveCasesCount(),
            this.getReopenedCasesCount(),
            this.getClosedCasesCount(),
            this.getTotalCasesCount()
        ]);

        return {
            'Active Cases': active,
            'Re-Opened Cases': reopened,
            'Closed Cases': closed,
            'Total Cases': total
        };
    }

    /**
     * Validate case count logic
     */
    async validateCaseCountLogic() {
        const counts = await this.getAllCaseCounts();

        const calculatedTotal = counts['Active Cases'] + counts['Closed Cases'] + counts['Re-Opened Cases'];
        const apiTotal = counts['Total Cases'];

        return {
            isValid: calculatedTotal === apiTotal,
            calculatedTotal,
            apiTotal,
            counts
        };
    }

    /**
     * Direct API call using provided token (for when capture fails)
     */
    async callCaseManagementAPI(endpoint, token) {
        const url = `${this.caseManagementBaseURL}/${endpoint}`;
        const resp = await this.request.get(url, {
            headers: this.getCommonHeaders(token)
        });

        if (resp.status() !== 200) {
            throw new Error(`${endpoint} API failed with status ${resp.status()}`);
        }

        const data = await resp.json();
        return this.extractCountFromResponse(data);
    }
}

module.exports = { TokenHelperPage };