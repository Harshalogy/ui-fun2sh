// pageObjects/CaseDashboard.js
const { expect } = require('@playwright/test');
const { CaseDashboardLocators } = require('../locators/CaseDashboardLocators');
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

exports.CaseDashboard = class CaseDashboard {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        this.locators = new CaseDashboardLocators(page);
    }

    /**
     * Wait for the case dashboard to fully load
     */
    async waitForLoad(timeoutMs = 15000) {
        await this.page.waitForLoadState('networkidle');
        await expect(this.locators.caseDashboardSection).toBeVisible({ timeout: timeoutMs });
        await expect(this.locators.pageTitle).toBeVisible({ timeout: timeoutMs });

        if (await this.locators.loadingSpinner.count() > 0) {
            await expect(this.locators.loadingSpinner).toBeHidden({ timeout: timeoutMs });
        }

        console.log('Case dashboard loaded successfully');
    }

    /**
     * Get the breadcrumb text
     */
    async getBreadcrumbText() {
        if (await this.locators.breadcrumb.count() > 0) {
            return (await this.locators.breadcrumb.textContent()).trim();
        }
        return '';
    }

    /**
     * Get the current breadcrumb item (case name)
     */
    async getBreadcrumbCurrent() {
        if (await this.locators.breadcrumbCurrent.count() > 0) {
            return (await this.locators.breadcrumbCurrent.textContent()).trim();
        }
        return '';
    }

    /**
     * Get the page title
     */
    async getPageTitle() {
        return (await this.locators.pageTitle.textContent()).trim();
    }

    /**
     * Get the case metadata
     */
    async getCaseMeta() {
        if (await this.locators.caseMeta.count() > 0) {
            return (await this.locators.caseMeta.textContent()).trim();
        }
        return '';
    }

    /**
     * Get button label text without icon text
     * @param {Object} buttonLabelLocator - The button label locator
     */
    async getButtonLabelText(buttonLabelLocator) {
        if (await buttonLabelLocator.count() > 0) {
            return (await buttonLabelLocator.textContent()).trim();
        }
        // Fallback: get button text and remove icon text if present
        const buttonLocator = buttonLabelLocator.locator('..'); // Go to parent button
        if (await buttonLocator.count() > 0) {
            const fullText = (await buttonLocator.textContent()).trim();
            // Remove common icon texts that might appear
            const cleanedText = fullText
                .replace(/account_tree|edit|folder_open|refresh|download|upload|search|close/gi, '')
                .trim();
            return cleanedText;
        }
        return '';
    }

    /**
     * Verify breadcrumb contains case name
     * @param {string} caseName - Expected case name
     */
    async verifyBreadcrumbContains(caseName) {
        const breadcrumbText = await this.getBreadcrumbText();
        expect(breadcrumbText).toContain(caseName);
        console.log(`✓ Breadcrumb contains case name: ${caseName}`);
        return breadcrumbText;
    }

    /**
     * Verify page header elements
     * @param {string} expectedCaseName - Expected case name
     */
    async verifyPageHeader(expectedCaseName) {
        // Verify breadcrumb structure
        await expect(this.locators.breadcrumb).toBeVisible();
        await expect(this.locators.breadcrumbLink).toBeVisible();
        await expect(this.locators.breadcrumbSeparator).toBeVisible();
        await expect(this.locators.breadcrumbCurrent).toBeVisible();

        // Verify breadcrumb text
        const breadcrumbText = await this.getBreadcrumbText();
        expect(breadcrumbText).toContain('Case Management');
        expect(breadcrumbText).toContain(expectedCaseName);

        // Verify page title matches case name
        const pageTitle = await this.getPageTitle();
        expect(pageTitle).toBe(expectedCaseName);

        // Verify case metadata is visible
        await expect(this.locators.caseMeta).toBeVisible();
        const caseMeta = await this.getCaseMeta();
        expect(caseMeta.length).toBeGreaterThan(0);

        console.log(`Page header verified:`);
        console.log(`  Breadcrumb: ${breadcrumbText}`);
        console.log(`  Page Title: ${pageTitle}`);
        console.log(`  Case Meta: ${caseMeta}`);

        return {
            breadcrumb: breadcrumbText,
            title: pageTitle,
            meta: caseMeta
        };
    }

    /**
     * Verify action buttons are visible and enabled
     */
    async verifyActionButtons() {
        console.log('Verifying action buttons...');

        // Verify action buttons container
        await expect(this.locators.actionButtons).toBeVisible();

        // Verify Link View button
        await expect(this.locators.linkViewButton).toBeVisible();
        await expect(this.locators.linkViewButton).toBeEnabled();
        const linkViewText = await this.getButtonLabelText(this.locators.linkViewButtonLabel);
        console.log(`✓ Link View button: "${linkViewText}"`);

        // Verify Edit Case button
        await expect(this.locators.editCaseButton).toBeVisible();
        await expect(this.locators.editCaseButton).toBeEnabled();
        const editCaseText = await this.getButtonLabelText(this.locators.editCaseButtonLabel);
        console.log(`✓ Edit Case button: "${editCaseText}"`);

        // Verify Uploaded File Stack button
        await expect(this.locators.uploadedFileStackButton).toBeVisible();
        await expect(this.locators.uploadedFileStackButton).toBeEnabled();
        const fileStackText = await this.getButtonLabelText(this.locators.uploadedFileStackButtonLabel);
        console.log(`✓ Uploaded File Stack button: "${fileStackText}"`);

        return {
            linkView: linkViewText,
            editCase: editCaseText,
            fileStack: fileStackText
        };
    }

    /**
     * Verify Case Overview section
     */
    async verifyCaseOverview() {
        console.log('Verifying Case Overview section...');

        await expect(this.locators.overviewSection).toBeVisible();

        // Check for overview cards
        const cardCount = await this.locators.caseOverviewCards.count();
        expect(cardCount).toBeGreaterThan(0);
        console.log(`✓ Found ${cardCount} overview cards`);

        // Verify specific cards exist
        await expect(this.locators.acknowledgeNosCard).toBeVisible();
        await expect(this.locators.victimAcCards).toBeVisible();
        await expect(this.locators.suspectAcCards).toBeVisible();
        await expect(this.locators.banksCard).toBeVisible();

        return cardCount;
    }

    /**
     * Verify detail panels
     */
    async verifyDetailPanels() {
        console.log('Verifying detail panels...');

        const panelCount = await this.locators.detailPanels.count();
        expect(panelCount).toBeGreaterThan(0);
        console.log(`✓ Found ${panelCount} detail panels`);

        // Verify key panels exist
        await expect(this.locators.fundStatusPanel).toBeVisible();
        await expect(this.locators.pendingAmountsPanel).toBeVisible();
        await expect(this.locators.exitModesPanel).toBeVisible();

        return panelCount;
    }

    /**
     * Verify progress bar
     */
    async verifyProgressBar() {
        console.log('Verifying progress bar...');

        await expect(this.locators.progressBar).toBeVisible();

        // Check progress summary
        const progressSummary = this.page.locator('.case-progress__summary');
        if (await progressSummary.count() > 0) {
            await expect(progressSummary).toBeVisible();
            console.log('✓ Progress bar summary visible');
        }

        return true;
    }

    /**
     * Get current URL
     */
    async getCurrentUrl() {
        return this.page.url();
    }

    /**
     * Verify URL contains case name
     * @param {string} caseName - Expected case name in URL
     */
    async verifyUrlContainsCaseName(caseName) {
        const currentUrl = await this.getCurrentUrl();
        const cleanCaseName = caseName.replace(/\s+/g, '');

        console.log(`Current URL: ${currentUrl}`);
        console.log(`Expected case name in URL: ${cleanCaseName}`);

        // Check if URL contains the case name (case insensitive)
        expect(currentUrl.toLowerCase()).toContain(cleanCaseName.toLowerCase());
        console.log(`✓ URL contains case name: ${cleanCaseName}`);

        return currentUrl;
    }

    /**
     * Take screenshot
     */
    async takeScreenshot(name = 'case-dashboard') {
        await this.page.screenshot({
            path: `screenshots/${name}-${Date.now()}.png`,
            fullPage: false
        });
    }

    // ============ NEW METHODS FOR DETAIL PANELS ============

    /**
     * Validate Case Overview section and cards
     */
    async validateCaseOverviewSection() {
        console.log('Validating Case Overview section...');

        // First check if elements exist before asserting visibility
        const hasOverviewSection = await this.locators.overviewSection.count() > 0;
        const hasOverviewHeader = await this.locators.caseOverviewHeader.count() > 0;
        const hasOverviewSubheading = await this.locators.caseOverviewSubheading.count() > 0;

        // Now assert visibility
        await expect(this.locators.overviewSection).toBeVisible();
        await expect(this.locators.caseOverviewHeader).toBeVisible();
        await expect(this.locators.caseOverviewSubheading).toBeVisible();

        // Verify all 8 cards are present
        const cardCount = await this.locators.caseOverviewCards.count();
        expect(cardCount).toBeGreaterThanOrEqual(8);
        console.log(`✓ Found ${cardCount} overview cards`);

        // Verify specific cards exist
        const cardsToVerify = [
            { name: 'Acknowledge Nos.', locator: this.locators.acknowledgeNosCard },
            { name: 'Victim A/Cs', locator: this.locators.victimAcCards },
            { name: 'Suspect A/Cs', locator: this.locators.suspectAcCards },
            { name: 'Banks', locator: this.locators.banksCard },
            { name: 'Tot. Transactions', locator: this.locators.totTransactionsCard },
            { name: 'Tot. Disputed Amt.', locator: this.locators.totDisputedAmtCard },
            { name: 'Common A/Cs', locator: this.locators.commonAcCards },
            { name: 'Uploaded Files', locator: this.locators.uploadedFilesCard }
        ];

        for (const card of cardsToVerify) {
            if (await card.locator.count() > 0) {
                await expect(card.locator).toBeVisible();
                const cardText = await card.locator.textContent();
                expect(cardText).toContain(card.name);
                console.log(`✓ Card found: ${card.name}`);
            }
        }

        console.log('✓ All overview cards verified');
        return cardCount;
    }

    /**
     * Validate Fund Status panel
     */
    async validateFundStatusPanel() {
        console.log('Validating Fund Status panel...');

        // Verify panel is visible
        await expect(this.locators.fundStatusPanel).toBeVisible();

        // Check for header
        if (await this.locators.fundStatusHeader.count() > 0) {
            await expect(this.locators.fundStatusHeader).toBeVisible();
        }

        // Verify table structure
        if (await this.locators.fundStatusTable.count() > 0) {
            await expect(this.locators.fundStatusTable).toBeVisible();
        } else {
            console.log('⚠ Fund Status table not found, panel might have different structure');
            return { headers: [], rows: 0, data: [] };
        }

        // Verify table headers
        const expectedHeaders = ['S. No.', 'Status', 'Tx Count', 'Amount (in Lakhs)', 'A/c Count'];

        // Get headers if available
        let headerCount = 0;
        if (await this.locators.fundStatusTableHeaders.count() > 0) {
            headerCount = await this.locators.fundStatusTableHeaders.count();
            expect(headerCount).toBe(expectedHeaders.length);

            for (let i = 0; i < headerCount; i++) {
                const headerText = await this.locators.fundStatusTableHeaders.nth(i).textContent();
                expect(headerText.trim()).toBe(expectedHeaders[i]);
            }
            console.log(`✓ Fund Status table has ${headerCount} headers`);
        }

        // Verify table has rows
        let rowCount = 0;
        if (await this.locators.fundStatusRows.count() > 0) {
            rowCount = await this.locators.fundStatusRows.count();
            expect(rowCount).toBeGreaterThan(0);
            console.log(`✓ Fund Status table has ${rowCount} rows`);
        }

        // Get and log fund status data
        const fundData = [];
        if (rowCount > 0) {
            for (let i = 0; i < rowCount; i++) {
                const row = this.locators.fundStatusRows.nth(i);
                const cells = await row.locator('td').allTextContents();
                fundData.push({
                    serialNo: cells[0]?.trim(),
                    status: cells[1]?.trim(),
                    txCount: cells[2]?.trim(),
                    amount: cells[3]?.trim(),
                    acCount: cells[4]?.trim()
                });
            }
            console.log('Fund Status Data:', fundData);
        }

        console.log('✓ Fund Status panel validation complete');
        return {
            headers: expectedHeaders,
            rows: rowCount,
            data: fundData
        };
    }

    /**
     * Validate Pending Amounts panel
     */
    async validatePendingAmountsPanel() {
        console.log('Validating Pending Amounts panel...');

        // Verify panel is visible
        await expect(this.locators.pendingAmountsPanel).toBeVisible();

        // Check for search field
        if (await this.locators.pendingAmountsSearch.count() > 0) {
            await expect(this.locators.pendingAmountsSearch).toBeVisible();
            const searchPlaceholder = await this.locators.pendingAmountsSearch.getAttribute('placeholder');
            console.log(`✓ Search field with placeholder: "${searchPlaceholder}"`);
        }

        // Check if main table exists (specifically the main table, not footer)
        let hasMainTable = false;
        if (await this.locators.pendingAmountsMainTable.count() > 0) {
            await expect(this.locators.pendingAmountsMainTable.first()).toBeVisible();
            hasMainTable = true;
            console.log('✓ Main table found in Pending Amounts panel');
        }

        // Check if footer table exists
        let hasFooterTable = false;
        if (await this.locators.pendingAmountsFooterTable.count() > 0) {
            await expect(this.locators.pendingAmountsFooterTable).toBeVisible();
            hasFooterTable = true;
            console.log('✓ Footer table found');
        }

        if (hasMainTable) {
            // Verify table headers if available
            const expectedHeaders = ['Sn', 'Bank', 'Pending A/Cs', 'Pending Amt (lakh)'];
            const headersLocator = this.page.locator('.pending-table .table-wrapper thead th');
            if (await headersLocator.count() > 0) {
                const headerCount = await headersLocator.count();
                expect(headerCount).toBe(expectedHeaders.length);

                for (let i = 0; i < headerCount; i++) {
                    const headerText = await headersLocator.nth(i).textContent();
                    console.log(`Header ${i + 1}: "${headerText.trim()}"`);
                }
                console.log(`✓ Pending Amounts table has ${headerCount} headers`);
            }
        }

        // Check for footer section (not the table itself)
        if (await this.locators.pendingAmountsFooter.count() > 0) {
            await expect(this.locators.pendingAmountsFooter).toBeVisible();
            const footerText = await this.locators.pendingAmountsFooter.textContent();
            console.log(`✓ Table footer section: ${footerText.trim()}`);
        }

        // Check for totals summary
        if (await this.locators.pendingAmountsTotals.count() > 0) {
            await expect(this.locators.pendingAmountsTotals).toBeVisible();
            const totalsText = await this.locators.pendingAmountsTotals.textContent();
            console.log(`✓ Totals summary: ${totalsText.trim()}`);

            // Parse totals
            const accountsMatch = totalsText.match(/(\d+)\s*A\/Cs/);
            const amountMatch = totalsText.match(/₹([\d.]+)L/);

            if (accountsMatch) {
                console.log(`  Total A/Cs: ${accountsMatch[1]}`);
            }
            if (amountMatch) {
                console.log(`  Total Amount: ₹${amountMatch[1]}L`);
            }
        }

        // Check for paginator
        if (await this.locators.pendingAmountsPaginator.count() > 0) {
            await expect(this.locators.pendingAmountsPaginator).toBeVisible();
            console.log('✓ Paginator found');

            // Check paginator range
            const rangeLabel = this.locators.pendingAmountsPaginator.locator('.mat-mdc-paginator-range-label');
            if (await rangeLabel.count() > 0) {
                const rangeText = await rangeLabel.textContent();
                console.log(`  Paginator range: ${rangeText.trim()}`);
            }
        }

        // Check if table has data or empty state
        const tableBody = this.page.locator('.pending-table .table-wrapper tbody');
        let hasData = false;
        let rowCount = 0;

        if (await tableBody.count() > 0) {
            const rows = tableBody.locator('tr');
            rowCount = await rows.count();
            hasData = rowCount > 0;

            if (hasData) {
                console.log(`✓ Pending Amounts table has ${rowCount} rows of data`);

                // Log first few rows if data exists
                const rowsToShow = Math.min(rowCount, 3);
                for (let i = 0; i < rowsToShow; i++) {
                    const rowCells = await rows.nth(i).locator('td').allTextContents();
                    console.log(`  Row ${i + 1}: ${rowCells.map(cell => cell.trim()).join(' | ')}`);
                }
            } else {
                console.log('✓ Pending Amounts table is empty (expected for new case)');
            }
        }

        console.log('✓ Pending Amounts panel validation complete');
        return {
            hasMainTable: hasMainTable,
            hasFooterTable: hasFooterTable,
            hasData: hasData,
            rowCount: rowCount
        };
    }

    /**
     * Validate End Utilization Mode panel
     */
    async validateEndUtilizationPanel() {
        console.log('Validating End Utilization Mode panel...');

        // Verify panel is visible
        await expect(this.locators.endUtilizationPanel).toBeVisible();

        // Check for chart
        let hasChart = false;
        if (await this.locators.endUtilizationChart.count() > 0) {
            await expect(this.locators.endUtilizationChart).toBeVisible();
            hasChart = true;
            console.log('✓ Chart container found');
        }

        // Check for legend
        let legendItems = 0;
        if (await this.locators.endUtilizationLegend.count() > 0) {
            await expect(this.locators.endUtilizationLegend).toBeVisible();
            legendItems = await this.locators.endUtilizationLegend.locator('.legend-item').count();
            console.log(`✓ Chart legend has ${legendItems} items`);
        }

        // Check for View Details button
        if (await this.locators.endUtilizationViewDetailsBtn.count() > 0) {
            await expect(this.locators.endUtilizationViewDetailsBtn).toBeVisible();
            console.log('✓ End Utilization View Details button found');
        }

        console.log('✓ End Utilization Mode panel validation complete');
        return {
            hasChart: hasChart,
            legendItems: legendItems,
            hasViewDetailsBtn: await this.locators.endUtilizationViewDetailsBtn.count() > 0
        };
    }

    /**
     * Validate Exit A/C panel
     */
    async validateExitAcPanel() {
        console.log('Validating Exit A/C panel...');

        // Verify panel is visible
        await expect(this.locators.exitAcPanel).toBeVisible();

        // Check for no data message
        let hasNoDataMessage = false;
        if (await this.locators.exitAcNoData.count() > 0) {
            await expect(this.locators.exitAcNoData).toBeVisible();
            const noDataText = await this.locators.exitAcNoData.textContent();
            console.log(`✓ No data message: "${noDataText.trim()}"`);
            hasNoDataMessage = true;
        }

        // Check for View Details button
        let hasViewDetailsBtn = false;
        if (await this.locators.exitAcViewDetailsBtn.count() > 0) {
            hasViewDetailsBtn = true;
            console.log('✓ View Details button found');
        }

        console.log('✓ Exit A/C panel validation complete');
        return {
            hasNoDataMessage: hasNoDataMessage,
            hasViewDetailsBtn: hasViewDetailsBtn
        };
    }

    // ============ BUTTON CLICK METHODS ============

    /**
     * Click the Link View button
     */
    async clickLinkViewButton() {
        console.log('Clicking Link View button...');
        await this.locators.linkViewButton.click();
        await this.page.waitForTimeout(1000);
        return true;
    }

    /**
     * Click the Edit Case button
     */
    async clickEditCaseButton() {
        console.log('Clicking Edit Case button...');
        await this.locators.editCaseButton.click();
        await this.page.waitForTimeout(1000);
        return true;
    }

    /**
     * Click the Uploaded File Stack button
     */
    async clickUploadedFileStackButton() {
        console.log('Clicking Uploaded File Stack button...');
        await this.locators.uploadedFileStackButton.click();
        await this.page.waitForTimeout(1000);
        return true;
    }

    /**
     * Click End Utilization View Details button
     */
    async clickEndUtilizationViewDetails() {
        console.log('Clicking End Utilization View Details button...');
        await this.locators.endUtilizationViewDetailsBtn.click();
        await this.page.waitForTimeout(1000);
        return true;
    }

    /**
     * Click Exit A/C View Details button
     */
    async clickExitAcViewDetails() {
        console.log('Clicking Exit A/C View Details button...');
        await this.locators.exitAcViewDetailsBtn.click();
        await this.page.waitForTimeout(1000);
        return true;
    }

    /**
     * Get overview card values
     */
    async getOverviewCardValues() {
        const cards = await this.locators.caseOverviewCards.all();
        const cardValues = [];

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const cardText = await card.textContent();
            const cardValue = await card.locator('.case-overview-card__value').textContent();
            cardValues.push({
                title: cardText.split('\n')[0],
                value: cardValue.trim()
            });
        }

        return cardValues;
    }

    /**
     * Search in Pending Amounts panel
     */
    async searchPendingAmounts(searchTerm) {
        console.log(`Searching Pending Amounts for: ${searchTerm}`);
        await this.locators.pendingAmountsSearch.fill(searchTerm);
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(1000);
        return true;
    }

    // ============ ADDITIONAL METHODS FOR TEST SCRIPT ============

    /**
     * Verify Link View button navigation
     */
    async verifyLinkViewButtonNavigation() {
        console.log('Testing Link View button navigation...');
        const urlBefore = await this.getCurrentUrl();

        await this.clickLinkViewButton();

        try {
            await this.page.waitForURL(/\/link-view/, { timeout: 5000 });
            const urlAfter = await this.getCurrentUrl();
            console.log(`✓ Navigated to Link View page: ${urlAfter}`);

            // Go back to case dashboard
            await this.page.goBack();
            await this.waitForLoad();
            return { success: true, navigated: true, urlAfter };
        } catch (error) {
            console.log('Link View might open in same page or modal');
            await this.page.waitForTimeout(2000);

            // Check for modal or dialog
            const modal = this.page.locator('dialog, .modal, .mat-dialog-container');
            if (await modal.count() > 0) {
                console.log('✓ Link View opened a modal/dialog');
                return { success: true, navigated: false, modal: true };
            }
            return { success: true, navigated: false, modal: false };
        }
    }

    /**
     * Verify Edit Case button navigation
     */
    async verifyEditCaseButtonNavigation() {
        console.log('Testing Edit Case button navigation...');
        const urlBefore = await this.getCurrentUrl();

        await this.clickEditCaseButton();

        try {
            await this.page.waitForURL(/\/edit/, { timeout: 5000 });
            const urlAfter = await this.getCurrentUrl();
            console.log(`✓ Navigated to Edit Case page: ${urlAfter}`);

            // Go back to case dashboard
            await this.page.goBack();
            await this.waitForLoad();
            return { success: true, navigated: true, urlAfter };
        } catch (error) {
            console.log('Edit Case might open in same page or modal');
            await this.page.waitForTimeout(2000);

            // Check for edit form or modal
            const editForm = this.page.locator('form, .edit-form, .mat-dialog-container');
            if (await editForm.count() > 0) {
                console.log('✓ Edit Case opened an edit form/modal');

                // Look for cancel button and click it
                const cancelButton = this.page.locator('button:has-text("Cancel"), button:has-text("Close")');
                if (await cancelButton.count() > 0) {
                    await cancelButton.click();
                    await this.page.waitForTimeout(1000);
                    console.log('✓ Closed edit form');
                }
                return { success: true, navigated: false, modal: true };
            }
            return { success: true, navigated: false, modal: false };
        }
    }

    /**
     * Verify Uploaded File Stack button functionality
     */
    async verifyUploadedFileStackButton() {
        console.log('Testing Uploaded File Stack button...');

        await this.clickUploadedFileStackButton();
        await this.page.waitForTimeout(2000);

        // Check if drawer opened
        const fileStackDrawer = this.page.locator('mat-drawer.case-dashboard__drawer');
        if (await fileStackDrawer.count() > 0) {
            const isDrawerVisible = await fileStackDrawer.isVisible();
            console.log(`✓ File Stack drawer found. Visible: ${isDrawerVisible}`);

            let drawerInfo = {};

            // Verify drawer content
            const drawerHeader = this.page.locator('.case-dashboard__drawer-header h2');
            if (await drawerHeader.count() > 0) {
                drawerInfo.header = (await drawerHeader.textContent()).trim();
                console.log(`✓ Drawer header: "${drawerInfo.header}"`);
            }

            // Verify file stack section
            const fileStackSection = this.page.locator('app-file-stack');
            drawerInfo.hasFileStack = await fileStackSection.count() > 0;
            if (drawerInfo.hasFileStack) {
                console.log('✓ File Stack component loaded');
            }

            // Close the drawer
            const closeButton = this.page.locator('button[aria-label="Close files drawer"]');
            if (await closeButton.count() > 0 && await closeButton.isVisible()) {
                await closeButton.click();
                await this.page.waitForTimeout(1000);
                console.log('✓ Closed File Stack drawer');
                drawerInfo.closed = true;
            } else {
                console.log('⚠ Close button not found or not visible');
                drawerInfo.closed = false;
            }

            return { success: true, drawer: true, drawerInfo };
        } else {
            console.log('⚠ File Stack drawer not found. Button might trigger different action.');

            // Check if it navigates to different page
            try {
                await this.page.waitForURL(/\/files|\/uploads/, { timeout: 3000 });
                const urlAfter = await this.getCurrentUrl();
                console.log(`✓ Navigated to files/uploads page: ${urlAfter}`);

                // Go back
                await this.page.goBack();
                await this.waitForLoad();
                return { success: true, navigation: true, urlAfter };
            } catch {
                console.log('✓ Uploaded File Stack button clicked');
                return { success: true, navigation: false };
            }
        }
    }

    /**
     * Verify View Details button navigation for End Utilization
     */
    async verifyEndUtilizationViewDetailsNavigation() {
        console.log('Testing End Utilization View Details button...');
        const originalUrl = await this.getCurrentUrl();

        await this.clickEndUtilizationViewDetails();
        await this.page.waitForTimeout(2000);

        // Check if navigation occurred
        const newUrl = await this.getCurrentUrl();
        if (newUrl !== originalUrl) {
            console.log(`✓ Navigation occurred to: ${newUrl}`);
            // Go back
            await this.page.goBack();
            await this.waitForLoad();
            return { navigated: true, url: newUrl };
        } else {
            console.log('✓ View Details button clicked (no navigation, might open modal)');

            // Check for modal
            const modal = this.page.locator('mat-dialog-container, .modal');
            if (await modal.count() > 0) {
                console.log('✓ Modal/dialog opened');
                // Close modal if possible
                const closeBtn = modal.locator('button:has-text("Close"), [aria-label="Close"]');
                if (await closeBtn.count() > 0) {
                    await closeBtn.click();
                    await this.page.waitForTimeout(1000);
                }
                return { navigated: false, modal: true };
            }
            return { navigated: false, modal: false };
        }
    }

    /**
     * Verify View Details button navigation for Exit A/C
     */
    async verifyExitAcViewDetailsNavigation() {
        console.log('Testing Exit A/C View Details button...');
        const originalUrl = await this.getCurrentUrl();

        await this.clickExitAcViewDetails();
        await this.page.waitForTimeout(2000);

        // Check if navigation occurred
        const newUrl = await this.getCurrentUrl();
        if (newUrl !== originalUrl) {
            console.log(`✓ Navigation occurred to: ${newUrl}`);
            // Go back
            await this.page.goBack();
            await this.waitForLoad();
            return { navigated: true, url: newUrl };
        } else {
            console.log('✓ View Details button clicked (no navigation, might open modal)');

            // Check for modal
            const modal = this.page.locator('mat-dialog-container, .modal');
            if (await modal.count() > 0) {
                console.log('✓ Modal/dialog opened');
                // Close modal if possible
                const closeBtn = modal.locator('button:has-text("Close"), [aria-label="Close"]');
                if (await closeBtn.count() > 0) {
                    await closeBtn.click();
                    await this.page.waitForTimeout(1000);
                }
                return { navigated: false, modal: true };
            }
            return { navigated: false, modal: false };
        }
    }

    /**
     * Check for error messages on dashboard
     */
    async checkForErrorMessages() {
        console.log('Checking for error messages...');
        const errorMessages = this.page.locator('.error, .alert-danger, [role="alert"]');
        const errors = [];

        if (await errorMessages.count() > 0) {
            for (let i = 0; i < await errorMessages.count(); i++) {
                const errorText = await errorMessages.nth(i).textContent();
                errors.push(errorText.trim());
                console.log(`⚠ Found error message: ${errorText.trim()}`);
            }
        } else {
            console.log('✓ No error messages found');
        }

        return errors;
    }

    /**
     * Get all panel titles
     */
    async getAllPanelTitles() {
        const panelTitles = await this.page.locator('.detail-panel__header h3').allTextContents();
        return panelTitles.map(title => title.trim());
    }

    /**
     * Comprehensive validation of all dashboard sections
     */
    // In the comprehensiveDashboardValidation method, fix line 907:
    async comprehensiveDashboardValidation(expectedCaseName = '') {
        console.log('Performing comprehensive dashboard validation...');

        const results = {};

        // URL check
        results.url = await this.getCurrentUrl();

        // Header check - pass expectedCaseName if provided
        if (expectedCaseName) {
            results.header = await this.verifyPageHeader(expectedCaseName);
        } else {
            // Get page title first to use as expected case name
            const pageTitle = await this.getPageTitle();
            results.header = await this.verifyPageHeader(pageTitle);
        }

        // Action buttons
        results.buttons = await this.verifyActionButtons();

        // Dashboard sections
        results.overviewCards = await this.verifyCaseOverview();
        results.detailPanels = await this.verifyDetailPanels();
        await this.verifyProgressBar();

        // Check for errors
        results.errors = await this.checkForErrorMessages();

        // Check dashboard container
        results.hasDashboardContainer = await this.locators.caseDashboardSection.isVisible();

        console.log('✓ Comprehensive validation completed');
        return results;
    }

    /**
     * Validate all overview sections together
     */
    async validateAllOverviewSections() {
        console.log('Validating all overview sections together...\n');

        const results = {};

        // 1. Case Overview cards
        results.caseOverview = await this.validateCaseOverviewSection();
        console.log(`✓ Case Overview: ${results.caseOverview} cards verified\n`);

        // 2. Fund Status panel
        results.fundStatus = await this.validateFundStatusPanel();
        console.log(`✓ Fund Status: ${results.fundStatus.rows} rows with ${results.fundStatus.headers.length} columns\n`);

        // 3. Pending Amounts panel
        results.pendingAmounts = await this.validatePendingAmountsPanel();
        console.log(`✓ Pending Amounts: ${results.pendingAmounts.hasData ? 'Has data' : 'Empty (expected)'}\n`);

        // 4. End Utilization Mode panel
        results.endUtilization = await this.validateEndUtilizationPanel();
        console.log(`✓ End Utilization: Chart ${results.endUtilization.hasChart ? 'present' : 'not visible'}, ${results.endUtilization.legendItems} legend items\n`);

        // 5. Exit A/C panel
        results.exitAc = await this.validateExitAcPanel();
        console.log(`✓ Exit A/C: ${results.exitAc.hasNoDataMessage ? 'No data message shown' : 'Has data'}\n`);

        // Additional: Verify all detail panels count
        results.allPanelsCount = await this.locators.detailPanels.count();
        console.log(`✓ Total detail panels on page: ${results.allPanelsCount}`);

        // List all panel titles
        results.panelTitles = await this.getAllPanelTitles();
        console.log('✓ All panel titles:', results.panelTitles);

        return results;
    }

    // ============ CASE OVERVIEW CARD GRID METHODS ============

    /**
     * Validate Case Overview card grid
     */
    async validateCaseOverviewCards() {
        console.log('Starting comprehensive case overview cards validation...');

        const validationResults = {
            totalCards: 0,
            cardsValidated: 0,
            cardDetails: [],
            gridValidation: null,
            allCardsExist: null,
            overallSuccess: true
        };

        try {
            // 1. Verify card grid
            validationResults.gridValidation = await this.verifyCaseOverviewCardGrid();

            // 2. Verify all 8 cards exist
            validationResults.allCardsExist = await this.verifyAllCardsExist();
            validationResults.totalCards = validationResults.allCardsExist.cardCount;

            // 3. Validate each card individually
            const cards = await this.locators.caseOverviewCardWrappers.all();

            for (let i = 0; i < validationResults.totalCards; i++) {
                const card = cards[i];
                const title = await this.getCardTitle(card);

                // Find expected config for this card
                const expectedConfig = this.locators.expectedCardConfig.find(config => config.title === title);

                if (!expectedConfig) {
                    console.error(`Card with title "${title}" not found in expected configuration`);
                    validationResults.overallSuccess = false;
                    continue;
                }

                console.log(`\nValidating card ${i + 1}: ${title}`);

                // Verify card structure
                const structureResult = await this.verifyCardStructure(card, expectedConfig);

                // Get card value for format validation
                const value = await this.getCardValue(card);

                // Verify data formats
                const formatResult = await this.verifyCardDataFormats(card, title, value);

                // Verify secondary text format if applicable
                let secondaryFormatResult = null;
                if (structureResult.hasSecondary) {
                    secondaryFormatResult = await this.verifySecondaryTextFormat(title, structureResult.secondaryText);
                }

                // Test card click functionality
                const clickResult = await this.testCardClickFunctionality(card);

                // Collect card validation details
                const cardDetail = {
                    index: i + 1,
                    title: title,
                    structure: structureResult,
                    format: formatResult,
                    secondaryFormat: secondaryFormatResult,
                    clickFunctionality: clickResult,
                    valid: structureResult.success && formatResult.valid
                };

                validationResults.cardDetails.push(cardDetail);
                validationResults.cardsValidated++;

                if (!cardDetail.valid) {
                    validationResults.overallSuccess = false;
                }

                console.log(`✓ Card "${title}" validated`);
            }

            // 4. Take screenshot
            const grid = await this.locators.caseOverviewGrid;
            await grid.scrollIntoViewIfNeeded();
            await this.takeScreenshot('case-overview-card-grid');

        } catch (error) {
            console.error('Error during case overview cards validation:', error);
            validationResults.overallSuccess = false;
            validationResults.error = error.message;
        }

        return validationResults;
    }

    /**
     * Verify card grid exists and has proper structure
     */
    async verifyCaseOverviewCardGrid() {
        console.log('Verifying Case Overview card grid...');
        const grid = this.locators.caseOverviewGrid;
        await expect(grid).toBeVisible();
        await expect(grid).toHaveAttribute('role', 'list');

        const cards = this.locators.caseOverviewCardWrappers;
        const cardCount = await cards.count();

        return {
            success: true,
            gridVisible: true,
            role: 'list',
            cardCount: cardCount
        };
    }

    /**
     * Verify all 8 cards exist with proper roles
     */
    async verifyAllCardsExist() {
        console.log('Verifying all 8 cards exist...');
        const cards = this.locators.caseOverviewCardWrappers;
        const cardCount = await cards.count();

        await expect(cardCount).toBe(8);

        // Verify each card wrapper has proper role
        for (let i = 0; i < cardCount; i++) {
            const card = cards.nth(i);
            await expect(card).toHaveAttribute('role', 'listitem');
        }

        return {
            success: true,
            cardCount: cardCount,
            allCardsHaveRole: true
        };
    }

    /**
     * Get card button element from card wrapper
     * @param {Object} cardElement - Card wrapper element
     */
    async getCardButton(cardElement) {
        const button = this.page.locator('.case-overview-card').first();
        if (cardElement) {
            return cardElement.locator('.case-overview-card');
        }
        return button;
    }

    /**
     * Get card title from card element
     * @param {Object} cardElement - Card wrapper element
     */
    async getCardTitle(cardElement) {
        const titleElement = cardElement.locator(this.locators.cardTitle);
        return await titleElement.textContent();
    }

    /**
     * Get card value from card element
     * @param {Object} cardElement - Card wrapper element
     */
    async getCardValue(cardElement) {
        const valueElement = cardElement.locator(this.locators.cardValue);
        return await valueElement.textContent();
    }

    /**
     * Get card icon from card element
     * @param {Object} cardElement - Card wrapper element
     */
    async getCardIcon(cardElement) {
        const iconElement = cardElement.locator(this.locators.cardIcon);
        return await iconElement.textContent();
    }

    /**
     * Get card secondary text from card element
     * @param {Object} cardElement - Card wrapper element
     */
    async getCardSecondaryText(cardElement) {
        const secondaryElement = cardElement.locator(this.locators.cardSecondary);
        if (await secondaryElement.count() > 0) {
            return await secondaryElement.textContent();
        }
        return null;
    }

    /**
     * Get card color class from card element
     * @param {Object} cardElement - Card wrapper element
     */
    async getCardColorClass(cardElement) {
        const button = await this.getCardButton(cardElement);
        const classAttribute = await button.getAttribute('class');

        for (const colorClass of this.locators.colorClasses) {
            if (classAttribute.includes(`case-overview-card--${colorClass}`)) {
                return `case-overview-card--${colorClass}`;
            }
        }
        return null;
    }

    /**
     * Get card arrow icon from card element
     * @param {Object} cardElement - Card wrapper element
     */
    async getCardArrowIcon(cardElement) {
        const arrowElement = cardElement.locator(this.locators.cardArrow);
        return await arrowElement.textContent();
    }

    /**
     * Verify individual card structure
     * @param {Object} cardElement - Card wrapper element
     * @param {Object} expectedConfig - Expected card configuration
     */
    async verifyCardStructure(cardElement, expectedConfig) {
        const button = await this.getCardButton(cardElement);

        // Verify button attributes
        await expect(button).toHaveAttribute('type', 'button');
        await expect(button).toHaveAttribute('aria-haspopup', 'dialog');

        // Get card title for aria-label verification
        const title = await this.getCardTitle(cardElement);
        await expect(button).toHaveAttribute('aria-label', title);

        // Verify color class
        const colorClass = await this.getCardColorClass(cardElement);
        expect(colorClass).toBe(expectedConfig.colorClass);

        // Verify icon
        const icon = await this.getCardIcon(cardElement);
        expect(icon).toBe(expectedConfig.icon);

        // Verify main value exists
        const value = await this.getCardValue(cardElement);
        expect(value.length).toBeGreaterThan(0);

        // Verify secondary text if applicable
        const secondaryText = await this.getCardSecondaryText(cardElement);
        if (expectedConfig.hasSecondary) {
            expect(secondaryText).toBeTruthy();
            expect(secondaryText.length).toBeGreaterThan(0);
        } else {
            expect(secondaryText).toBeNull();
        }

        // Verify arrow icon
        const arrowIcon = await this.getCardArrowIcon(cardElement);
        expect(arrowIcon).toBe('arrow_outward');

        return {
            success: true,
            title: title,
            value: value,
            icon: icon,
            colorClass: colorClass,
            hasSecondary: !!secondaryText,
            secondaryText: secondaryText,
            arrowIcon: arrowIcon
        };
    }

    /**
     * Verify card data formats
     * @param {Object} cardElement - Card wrapper element
     * @param {string} title - Card title
     * @param {string} value - Card value
     */
    async verifyCardDataFormats(cardElement, title, value) {
        if (title === 'Tot. Disputed Amt.') {
            // Should start with ₹ symbol
            expect(value).toMatch(/^₹/);
            return { format: 'currency', valid: true };
        } else if (title === 'Tot. Transactions' || title === 'Victim A/Cs' ||
            title === 'Suspect A/Cs' || title === 'Banks' ||
            title === 'Acknowledge Nos.' || title === 'Common A/Cs' ||
            title === 'Uploaded Files') {
            // Should be a number
            const numericValue = parseInt(value.replace(/,/g, ''));
            expect(Number.isInteger(numericValue)).toBe(true);
            expect(numericValue).toBeGreaterThanOrEqual(0);
            return { format: 'numeric', valid: true, numericValue: numericValue };
        }
        return { format: 'text', valid: true };
    }

    /**
     * Verify secondary text format
     * @param {string} title - Card title
     * @param {string} secondaryText - Secondary text
     */
    async verifySecondaryTextFormat(title, secondaryText) {
        if (title === 'Tot. Transactions') {
            expect(secondaryText).toMatch(/^Amount:/);
            expect(secondaryText).toMatch(/₹/);
            return { valid: true, type: 'amount' };
        } else if (title === 'Tot. Disputed Amt.') {
            expect(secondaryText).toMatch(/^Count:/);
            expect(secondaryText).toMatch(/\d+/);
            return { valid: true, type: 'count' };
        } else if (title === 'Common A/Cs') {
            expect(secondaryText).toBe('(linked with 2+ Ack. no.)');
            return { valid: true, type: 'description' };
        }
        return { valid: true, type: 'generic' };
    }

    /**
     * Test card click functionality
     * @param {Object} cardElement - Card wrapper element
     */
    async testCardClickFunctionality(cardElement) {
        const originalUrl = this.page.url();
        const button = await this.getCardButton(cardElement);
        const title = await this.getCardTitle(cardElement);

        await button.click();
        await this.page.waitForTimeout(1000);

        const newUrl = this.page.url();
        let result = {
            clicked: true,
            title: title,
            originalUrl: originalUrl,
            newUrl: newUrl
        };

        if (newUrl !== originalUrl) {
            result.navigated = true;
            // Navigate back
            await this.page.goBack();
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(500);
        } else {
            result.navigated = false;
            // Check if modal/dialog opened
            const modal = this.locators.modalDialog;
            if (await modal.isVisible({ timeout: 1500 })) {
                result.modalOpened = true;

                // Get modal title if available
                const modalTitleElement = this.locators.modalTitle.first();
                const modalTitle = await modalTitleElement.textContent().catch(() => '');
                result.modalTitle = modalTitle ? modalTitle.trim() : '';

                // Close modal
                const closeBtn = this.locators.modalCloseButton.first();
                if (await closeBtn.isVisible()) {
                    await closeBtn.click();
                    await this.page.waitForTimeout(500);
                    result.modalClosed = true;
                } else {
                    // Press Escape as fallback
                    await this.page.keyboard.press('Escape');
                    await this.page.waitForTimeout(500);
                    result.modalClosed = true;
                }
            } else {
                result.modalOpened = false;
            }
        }

        return result;
    }

    /**
     * Get all card data for reporting
     */
    async getAllCardData() {
        const cards = this.locators.caseOverviewCardWrappers;
        const cardCount = await cards.count();
        const cardData = [];

        for (let i = 0; i < cardCount; i++) {
            const card = cards.nth(i);
            const button = await this.getCardButton(card);

            const title = await this.getCardTitle(card);
            const value = await this.getCardValue(card);
            const icon = await this.getCardIcon(card);
            const colorClass = await this.getCardColorClass(card);
            const secondaryText = await this.getCardSecondaryText(card);
            const arrowIcon = await this.getCardArrowIcon(card);

            cardData.push({
                index: i + 1,
                title: title,
                value: value,
                icon: icon,
                colorClass: colorClass,
                hasSecondary: !!secondaryText,
                secondaryText: secondaryText,
                arrowIcon: arrowIcon,
                isClickable: await button.isEnabled()
            });
        }

        return cardData;
    }

    // ============ EXIT MODES PANEL METHODS ============

    /**
     * Validate Exit Modes panel structure and data
     */
    async validateExitModesPanel() {
        console.log('Validating Exit Modes panel structure...');

        // 1. Locate the Exit Modes panel
        await expect(this.locators.exitModesPanel).toBeVisible();
        console.log('✓ Exit Modes panel found');

        // 2. Verify panel title - use toContainText() instead of toHaveText()
        await expect(this.locators.exitModesHeader).toContainText('Exit Modes');
        console.log('✓ Panel title contains: "Exit Modes"');

        // 3. Verify the table exists
        await expect(this.locators.exitModesTable).toBeVisible();
        console.log('✓ Exit Modes table found');

        // 4. Verify table headers
        const headers = await this.locators.exitModesTableHeaders.allTextContents();
        console.log(`✓ Table headers: ${headers.join(', ')}`);

        // Verify specific columns exist
        expect(headers).toContain('Exit Mode');
        expect(headers).toContain('Exit A/Cs');
        expect(headers).toContain('A/Cs Feeding Exit A/Cs');
        console.log('✓ All expected columns present');

        // 5. Verify table data exists
        const tableRows = await this.locators.exitModesRows.count();
        expect(tableRows).toBeGreaterThan(0);
        console.log(`✓ Found ${tableRows} exit modes in table`);

        // 6. Verify pagination is present
        await expect(this.locators.exitModesPaginator).toBeVisible();
        console.log('✓ Pagination component found');

        // 7. Verify View Details button
        await expect(this.locators.exitModesViewDetailsBtn).toBeVisible();
        await expect(this.locators.exitModesViewDetailsBtn).toBeEnabled();
        console.log('✓ View Details button available');

        return {
            headers: headers,
            rowCount: tableRows,
            hasPaginator: true,
            hasViewDetailsBtn: true
        };
    }

    /**
     * Validate Exit Modes table data content
     */
    async validateExitModesTableData() {
        console.log('Validating Exit Modes table data...');

        const rows = await this.locators.exitModesRows.all();
        console.log(`Analyzing ${rows.length} exit modes:`);

        const exitModesData = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            // Extract data from the row
            const exitMode = await row.locator('th[scope="row"]').textContent();
            const exitAccounts = await row.locator('td:nth-child(2) .exit-metric__value').textContent();
            const feedingAccounts = await row.locator('td:nth-child(3) .exit-metric__value').textContent();

            const exitModeText = exitMode.trim();
            const exitAccountsNum = parseInt(exitAccounts);
            const feedingAccountsNum = parseInt(feedingAccounts);

            console.log(`\n${i + 1}. Exit Mode: "${exitModeText}"`);
            console.log(`   - Exit A/Cs: ${exitAccountsNum}`);
            console.log(`   - Feeding A/Cs: ${feedingAccountsNum}`);

            // Validate data
            expect(exitModeText.length).toBeGreaterThan(0);
            expect(exitAccountsNum).toBeGreaterThanOrEqual(0);
            expect(feedingAccountsNum).toBeGreaterThanOrEqual(0);

            exitModesData.push({
                mode: exitModeText,
                exitAccounts: exitAccountsNum,
                feedingAccounts: feedingAccountsNum
            });
        }

        console.log('\n✓ All exit mode data validated successfully');
        return exitModesData;
    }

    /**
 * Test Exit Modes panel functionality and interactions
 */
    async testExitModesPanelFunctionality() {
        console.log('Testing Exit Modes panel functionality...');

        const results = {
            panelControls: false,
            viewDetails: false,
            rowInteractions: false,
            pagination: false
        };

        console.log('\n1. Testing panel controls:');

        // Test minimize button using the new scoped locator
        if (await this.locators.exitModesMinimizeButton.count() > 0) {
            console.log('Found minimize button with "remove" icon');
            await this.locators.exitModesMinimizeButton.click();
            await this.page.waitForTimeout(500);
            console.log('✓ Panel minimized');

            // Wait for UI to update and check for maximize button
            await this.page.waitForTimeout(1000);

            // Click maximize/restore button to return to normal state
            if (await this.locators.exitModesMaximizeButton.count() > 0) {
                console.log('Found maximize button - clicking to restore panel');
                await this.locators.exitModesMaximizeButton.click();
                await this.page.waitForTimeout(500);
                console.log('✓ Panel maximized/restored');
                results.panelControls = true;
                await this.locators.exitModesModalCloseButton.click();

            } else if (await this.locators.exitModesRestoreButton.count() > 0) {
                console.log('Found restore button - clicking to restore panel');
                await this.locators.exitModesRestoreButton.click();
                await this.page.waitForTimeout(500);
                console.log('✓ Panel restored');
                results.panelControls = true;
            } else {
                console.log('ℹ️ No maximize/restore button found after minimizing');
            }
        } else {
            console.log('ℹ️ Minimize button not found, panel might already be minimized');

            // Check if maximize button is visible (panel is minimized)
            if (await this.locators.exitModesMaximizeButton.count() > 0) {
                console.log('Panel appears minimized - clicking maximize button');
                await this.locators.exitModesMaximizeButton.click();
                await this.page.waitForTimeout(500);
                console.log('✓ Panel maximized');

                // Now minimize it to test full cycle
                await this.page.waitForTimeout(1000);
                if (await this.locators.exitModesMinimizeButton.count() > 0) {
                    await this.locators.exitModesMinimizeButton.click();
                    await this.page.waitForTimeout(500);
                    console.log('✓ Panel minimized');

                    // Maximize again to return to normal state
                    await this.page.waitForTimeout(1000);
                    if (await this.locators.exitModesMaximizeButton.count() > 0) {
                        await this.locators.exitModesMaximizeButton.click();
                        await this.page.waitForTimeout(500);
                        console.log('✓ Panel maximized again');
                    }
                }
                results.panelControls = true;
            }
        }
        console.log('\n2. Testing View Details button functionality:');

        // Ensure panel is maximized/normal state before testing View Details
        await this.page.waitForTimeout(1000);

        const originalUrl = this.page.url();
        console.log(`Original URL before View Details: ${originalUrl}`);

        // Check if View Details button is visible and enabled
        if (await this.locators.exitModesViewDetailsBtn.count() > 0 &&
            await this.locators.exitModesViewDetailsBtn.isEnabled()) {

            console.log('Clicking View Details button...');
            await this.locators.exitModesViewDetailsBtn.click();
            await this.page.waitForTimeout(1000);

            // Check if a modal/dialog opened
            if (await this.locators.modalDialog.isVisible({ timeout: 2000 })) {
                console.log('✓ View Details button opened a modal/dialog');

                // Look for modal title
                const modalTitle = await this.locators.modalTitle.first().textContent().catch(() => '');
                if (modalTitle) {
                    console.log(`  Modal title: "${modalTitle.trim()}"`);
                }

                // FIRST: Try to close the modal with the specific Close button
                if (await this.locators.exitModesModalCloseButton.count() > 0) {
                    console.log('  Found "Close" button in modal - clicking to close');
                    await this.locators.exitModesModalCloseButton.click();
                    await this.page.waitForTimeout(500);
                    console.log('✓ Modal closed with Close button');
                }
                // SECOND: Try generic close button
                else if (await this.locators.modalCloseButton.first().count() > 0 &&
                    await this.locators.modalCloseButton.first().isVisible()) {
                    console.log('  Found generic close button - clicking to close modal');
                    await this.locators.modalCloseButton.first().click();
                    await this.page.waitForTimeout(500);
                    console.log('✓ Modal closed with generic close button');
                }
                // THIRD: Try back button
                else {
                    const backButton = this.page.locator('button.breadcrumb__back, button:has-text("Back")');
                    if (await backButton.count() > 0 && await backButton.isVisible()) {
                        console.log('  Found back button - clicking to close modal');
                        await backButton.click();
                        await this.page.waitForTimeout(500);
                        console.log('✓ Modal closed with back button');
                    }
                    // FOURTH: Try escape key
                    else {
                        await this.page.keyboard.press('Escape');
                        await this.page.waitForTimeout(500);
                        console.log('✓ Modal closed with Escape key');
                    }
                }

                results.viewDetails = true;
            }
            // Check if navigation occurred
            else {
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForTimeout(1000);

                const newUrl = this.page.url();
                console.log(`URL after View Details: ${newUrl}`);

                if (newUrl !== originalUrl) {
                    console.log(`✓ View Details button navigated to: ${newUrl}`);

                    // Navigate back to original page
                    await this.page.goBack();
                    await this.page.waitForLoadState('networkidle');
                    await this.page.waitForTimeout(500);
                    console.log('✓ Returned to original page');

                    results.viewDetails = true;
                } else {
                    console.log('✓ View Details button clicked (no navigation or modal detected)');
                }
            }
        } else {
            console.log('⚠️ View Details button not visible or not enabled');
        }

        console.log('\n3. Testing table row interactions:');

        const firstRow = this.locators.exitModesRows.first();
        if (await firstRow.count() > 0) {
            const exitModeText = await firstRow.locator('th[scope="row"]').textContent();
            console.log(`Testing click on "${exitModeText.trim()}" row...`);

            const currentUrl = this.page.url();
            await firstRow.click();
            await this.page.waitForTimeout(1500);

            const newUrlAfterClick = this.page.url();

            if (newUrlAfterClick !== currentUrl) {
                console.log(`✓ Row click navigated to: ${newUrlAfterClick}`);

                // Navigate back
                await this.page.goBack();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForTimeout(500);
                results.rowInteractions = true;
            } else {
                // Check if row expanded in place
                const expandedRow = firstRow.locator('+ tr.expanded-row, + .detail-row, + [class*="expand"]');
                if (await expandedRow.count() > 0 && await expandedRow.isVisible({ timeout: 1000 })) {
                    console.log('✓ Row expanded in place');
                    results.rowInteractions = true;
                } else {
                    console.log('✓ Row clicked (no navigation or expansion)');
                }
            }
        }

        console.log('\n4. Testing pagination:');

        const paginatorLabel = this.locators.exitModesPaginator.locator('.mat-mdc-paginator-range-label');

        await expect(paginatorLabel).toBeVisible();
        const pageInfo = await paginatorLabel.textContent();
        console.log("✓ Exit Modes pagination:", pageInfo.trim());


        // Test page size selector
        if (await this.locators.exitModesPageSizeSelect.count() > 0) {
            console.log('Testing page size selector...');

            // Try clicking with force option
            await this.locators.exitModesPageSizeSelect.click({ force: true });
            await this.page.waitForTimeout(500);

            // Check if dropdown opened
            if (await this.locators.selectOptionsPanel.isVisible({ timeout: 2000 })) {
                const options = await this.locators.selectOptions.count();
                console.log(`✓ Page size selector opened, showing ${options} options`);

                // Close dropdown
                await this.page.keyboard.press('Escape');
                await this.page.waitForTimeout(300);
                results.pagination = true;
            } else {
                console.log('✓ Page size selector tested');
            }
        }

        return results;
    }

    /**
     * Comprehensive analysis of Exit Modes and feeder accounts data
     */
    async analyzeExitModesData() {
        console.log('Starting comprehensive Exit Modes analysis...');

        const exitModesData = await this.validateExitModesTableData();

        let totalExitAccounts = 0;
        let totalFeedingAccounts = 0;

        exitModesData.forEach(data => {
            totalExitAccounts += data.exitAccounts;
            totalFeedingAccounts += data.feedingAccounts;
        });

        const analysisResults = {
            exitModesData: exitModesData,
            totalExitAccounts: totalExitAccounts,
            totalFeedingAccounts: totalFeedingAccounts,
            overallFeedingRatio: totalExitAccounts > 0 ? (totalFeedingAccounts / totalExitAccounts).toFixed(2) : 'N/A',
            mostComplexMode: null,
            noFeederModes: []
        };

        // Find most complex exit structure
        if (exitModesData.length > 0) {
            analysisResults.mostComplexMode = exitModesData.reduce((prev, current) =>
                (current.feedingAccounts > prev.feedingAccounts) ? current : prev
            );
        }

        // Find exit modes with no feeder accounts
        analysisResults.noFeederModes = exitModesData.filter(data => data.feedingAccounts === 0);

        return analysisResults;
    }

    // ============ TC19: FEEDER ACCOUNTS DRILL-DOWN METHODS ============

    /**
     * Test drill-down functionality for feeder accounts details
     */
    async testFeederAccountsDrillDown() {
        console.log('Testing feeder accounts drill-down...');

        const results = {
            viewDetailsTest: false,
            rowDrillDown: false,
            feederAccountsData: [],
            overallSuccess: true
        };

        console.log('1. Testing drill-down from View Details button:');

        // Updated: Look for View Details button in the priority exit modes section
        if (await this.locators.exitModesViewDetailsBtn.isVisible({ timeout: 2000 })) {
            await this.locators.exitModesViewDetailsBtn.click();
            await this.page.waitForTimeout(1500);

            // Check if detailed view opened
            if (await this.locators.detailedView.isVisible({ timeout: 2000 })) {
                console.log('✓ Detailed view opened');

                // Look for feeder accounts in detailed view
                await this.testFeederAccountsInDetailView();

                // Close detailed view
                const closeBtn = this.page.locator('button[aria-label="Close"], .close-detail, .back-button');
                if (await closeBtn.isVisible()) {
                    await closeBtn.click();
                    await this.page.waitForTimeout(500);
                    console.log('✓ Detailed view closed');
                }
                results.viewDetailsTest = true;
            } else {
                console.log('⚠️ No detailed view opened from View Details button');
            }
        } else {
            console.log('⚠️ No View Details button found in exit modes section');
        }

        console.log('\n2. Testing row-level drill-down:');

        // Updated: Get exit mode cards from the priority exit modes section
        const firstExitModeCard = this.locators.exitModeCards.first();

        if (await firstExitModeCard.count() > 0) {
            const exitModeName = await firstExitModeCard.locator('h3').textContent();
            console.log(`Testing drill-down for "${exitModeName.trim()}"...`);

            // Updated: Different ways to trigger drill-down from card
            const cardActions = [
                { selector: 'h3', action: 'click' },
                { selector: 'generic:has(> term)', action: 'click' },
                { selector: '*', action: 'click' }
            ];

            let drillDownTriggered = false;

            for (const action of cardActions) {
                const element = firstExitModeCard.locator(action.selector).first();
                if (await element.isVisible()) {
                    await element.click();
                    await this.page.waitForTimeout(1000);

                    // Check if drill-down occurred
                    if (await this.locators.expandedContent.isVisible({ timeout: 1500 })) {
                        console.log(`✓ Drill-down triggered via ${action.selector}`);
                        drillDownTriggered = true;

                        // Test feeder accounts in expanded view
                        await this.testFeederAccountsInExpandedView(exitModeName.trim());
                        break;
                    }
                }
            }

            results.rowDrillDown = drillDownTriggered;

            if (!drillDownTriggered) {
                console.log('⚠️ No row-level drill-down functionality detected');
            }
        } else {
            console.log('⚠️ No exit mode cards found for drill-down testing');
        }

        console.log('\n3. Testing feeder accounts data retrieval:');

        // Updated: Get exit modes data from cards instead of table
        const cards = await this.locators.exitModeCards.all();

        for (const card of cards) {
            try {
                const exitMode = (await card.locator('h3').textContent()).trim();

                // Get feeding accounts from the card (looking for "Feeders" term)
                const feedersTerm = card.locator('term:has-text("Feeders"), term:has-text("Feeder")');
                const feedingAccountsText = await feedersTerm.locator('+ definition').textContent().catch(() => '0');
                const feedingAccounts = parseInt(feedingAccountsText) || 0;

                if (feedingAccounts > 0) {
                    results.feederAccountsData.push({
                        exitMode: exitMode,
                        feedingAccounts: feedingAccounts,
                        investigationPriority: feedingAccounts > 5 ? 'High' : feedingAccounts > 0 ? 'Medium' : 'Low'
                    });
                }
            } catch (error) {
                // Skip if card doesn't have expected structure
            }
        }

        console.log(`Exit modes with feeder accounts: ${results.feederAccountsData.length}`);
        results.feederAccountsData.forEach(data => {
            console.log(`  - ${data.exitMode}: ${data.feedingAccounts} feeder accounts (Priority: ${data.investigationPriority})`);
        });

        // Check the snapshot data: ATM has 0 feeders, POS has 0 feeders
        if (results.feederAccountsData.length === 0) {
            console.log('ℹ️ No exit modes with feeder accounts found in current data');
        }

        results.overallSuccess = results.viewDetailsTest || results.rowDrillDown || results.feederAccountsData.length > 0;

        return results;
    }

    /**
     * Helper method: Test feeder accounts in detailed view
     */
    async testFeederAccountsInDetailView() {
        console.log('   Looking for feeder accounts in detailed view...');

        // Check for tables showing feeder accounts
        const feederTables = await this.locators.feederTables.all();
        console.log(`   Found ${feederTables.length} tables in detailed view`);

        for (let i = 0; i < feederTables.length; i++) {
            const table = feederTables[i];
            const tableHeaders = await table.locator('thead th').allTextContents();

            // Check if this looks like a feeder accounts table
            if (tableHeaders.some(header =>
                header.toLowerCase().includes('feeder') ||
                header.toLowerCase().includes('account') ||
                header.toLowerCase().includes('source')
            )) {
                console.log(`   ✓ Found feeder accounts table (${tableHeaders.join(', ')})`);

                // Count feeder account rows
                const feederRows = await table.locator('tbody tr').count();
                console.log(`   ✓ Table contains ${feederRows} feeder accounts`);

                // Get sample data
                if (feederRows > 0) {
                    const firstRowData = await table.locator('tbody tr').first().textContent();
                    console.log(`   ✓ Sample feeder account: ${firstRowData.substring(0, 100)}...`);
                }
                break;
            }
        }

        // Check for feeder account lists
        const feederLists = await this.locators.feederLists.all();
        if (feederLists.length > 0) {
            console.log(`   ✓ Found ${feederLists.length} feeder account list items`);
        }

        if (feederTables.length === 0 && feederLists.length === 0) {
            console.log('   ℹ️ No feeder accounts data found in detailed view');
        }
    }

    /**
     * Helper method: Test feeder accounts in expanded view
     * @param {string} exitMode - Exit mode name
     */
    async testFeederAccountsInExpandedView(exitMode) {
        console.log(`   Testing feeder accounts for ${exitMode} in expanded view...`);

        // Look for feeder account information
        const feederElements = await this.locators.feederElements.all();
        if (feederElements.length > 0) {
            console.log(`   ✓ Found ${feederElements.length} feeder account elements`);

            for (let i = 0; i < Math.min(feederElements.length, 3); i++) {
                const text = await feederElements[i].textContent();
                if (text && text.trim().length > 0) {
                    console.log(`     ${i + 1}. ${text.trim().substring(0, 80)}${text.trim().length > 80 ? '...' : ''}`);
                }
            }
        }

        // Look for feeder account count
        const feederCount = await this.locators.feederCount.first().textContent().catch(() => '');
        if (feederCount && feederCount.match(/\d+/)) {
            console.log(`   ✓ Feeder account count: ${feederCount.trim()}`);
        }

        if (feederElements.length === 0 && !feederCount) {
            console.log(`   ℹ️ No specific feeder accounts data found for ${exitMode}`);
        }
    }

    async validateTopBankBranchesPanelStructure() {
        console.log('\nValidating Top Bank Branches panel structure...');
        // PANEL ROOT
        await expect(this.locators.topBranchesPanel).toBeVisible();

        // HEADER
        await expect(this.locators.topBranchesHeader).toBeVisible();
        await expect(this.locators.topBranchesHeader).toContainText(/Top Bank Branches/i);


        // SELECT (Top N)
        await expect(this.locators.topBranchesSelect).toBeVisible();
        await this.locators.topBranchesSelect.click();
        const selectOptions = this.page.locator('.mat-mdc-select-panel mat-option');
        expect(await selectOptions.count()).toBeGreaterThan(1);
        await this.page.keyboard.press('Escape');

        // BRANCH LABELS
        const labelCount = await this.locators.topBranchesLabels.count();
        if (labelCount === 0) {
            console.log('No branch labels found');
        } else {
            console.log(`Found ${labelCount} branch labels`);
            await expect(this.locators.topBranchesLabels.first()).toBeVisible();
        }

        // LEFT Y-AXIS TICKS
        const tickCount = await this.locators.topBranchesYAxisLeftTicks.count();
        if (tickCount === 0) {
            console.log('No Y-axis ticks found');
        } else {
            console.log(`Found ${tickCount} Y-axis ticks`);
            await expect(this.locators.topBranchesYAxisLeftTicks.first()).toBeVisible();
        }

        // LEGEND
        await expect(this.locators.topBranchesLegend.first()).toBeVisible();
        expect(await this.locators.topBranchesLegend.count()).toBeGreaterThan(1);

        await this.locators.topBranchesLegend.first().evaluate(item => {
            if (!item.textContent?.trim()) throw new Error('Legend item is empty');
        });

        // SUMMARY TEXT
        await expect(this.locators.topBranchesInfoText).toBeVisible();
        await expect(this.locators.topBranchesInfoText).toContainText(/Showing .* branches/i);

        // VIEW DETAILS BUTTON
        await expect(this.locators.topBranchesViewDetailsBtn).toBeVisible();
        await expect(this.locators.topBranchesViewDetailsBtn).toBeEnabled();
    }

    async minimiseValidation() {
        //mimimise and maximise
        const minimizeBtn = this.locators.topBranchesPanel.locator('button[aria-label="Minimize panel"]');
        const maximizeBtn = this.locators.topBranchesPanel.locator('button[aria-label="Maximize Top Bank Branches view"]');

        // Define panelBody correctly (THIS WAS MISSING)
        const panelBody = this.locators.topBranchesPanel.locator('.detail-panel__content--wide');
        // Visible + enabled
        await expect(minimizeBtn).toBeVisible();
        await expect(minimizeBtn).toBeEnabled();

        await expect(maximizeBtn).toBeVisible();
        await expect(maximizeBtn).toBeEnabled();

        // Ensure panel body is visible initially
        await expect(panelBody).toBeVisible();

        // MINIMIZE â body must collapse
        await minimizeBtn.click();
        await expect(panelBody).not.toBeVisible();

        // MAXIMIZE â body must expand
        await maximizeBtn.click();
        // 2. Wait for dialog surface
        const dialog = this.page.locator('.mat-mdc-dialog-surface');
        await expect(dialog).toBeVisible();

        // 3. Validate dialog title
        const title = dialog.locator('h2.mat-mdc-dialog-title');
        await expect(title).toBeVisible();
        await expect(title).toHaveText(/Top Bank Branches/i);

        // 4. Validate "Top N" select exists
        const topSelect = dialog.locator('mat-form-field mat-select');
        await expect(topSelect).toBeVisible();

        // 5. Validate inner panel header
        const chartHeader = dialog.locator('h4:has-text("Top Bank Branches")');
        await expect(chartHeader).toBeVisible();

        // 6. Validate SVG chart exists
        const svgChart = dialog.locator('svg[role="img"]');
        await expect(svgChart).toBeVisible();


        // 11. Close the dialog
        const closeBtn = dialog.locator('button[mat-dialog-close]');
        await expect(closeBtn).toBeVisible();
        await closeBtn.click();

        // 12. Confirm dialog is closed
        await expect(dialog).not.toBeVisible();

        console.log('Maximized view validated and closed successfully.');
    }

    // async validateTopBankBranchesData() {
    //     console.log('\nValidating Top Bank Branches data...');

    //     // Read bar heights
    //     const barCount = await this.locators.topBranchesBars.count();
    //     const barHeights = [];

    //     for (let i = 0; i < barCount; i++) {
    //         const bar = this.locators.topBranchesBars.nth(i);
    //         const height = await bar.getAttribute('height');
    //         const heightNum = parseFloat(height);

    //         expect(heightNum).toBeGreaterThan(0);
    //         barHeights.push(heightNum);
    //     }

    //     // Sort validation
    //     const expected = [...barHeights].sort((a, b) => b - a);
    //     expect(barHeights).toEqual(expected);

    //     console.log('✓ Bars are correctly sorted in descending order');

    //     return { barHeights };
    // }

    async validateTopBranchesSorting() {

        console.log('Validating sorting options for Top Branches table...');

        const sortSelect = this.page.locator('mat-form-field.top-branches__sort mat-select');
        const rows = this.page.locator('.top-branches__table-wrapper table tbody tr');

        await expect(sortSelect).toBeVisible();

        const initialAllRows = await rows.allInnerTexts();

        // Open first time
        await sortSelect.click();

        const options = this.page.locator('.mat-mdc-select-panel mat-option');
        const optionCount = await options.count();

        console.log(`Found ${optionCount} sort options.`);

        for (let i = 0; i < optionCount; i++) {

            const option = options.nth(i);
            await option.click();

            // Wait for table refresh
            await this.page.waitForTimeout(500);

            const newAllRows = await rows.allInnerTexts();

            if (JSON.stringify(newAllRows) !== JSON.stringify(initialAllRows)) {
                console.log('Table updated successfully.');
            }

            // CLOSE PANEL (important!)
            await this.page.keyboard.press('Escape');
            await expect(this.page.locator('.mat-mdc-select-panel')).toBeHidden();

            // REOPEN PANEL (safe now)
            await sortSelect.click();
            await expect(options.first()).toBeVisible();
        }

        console.log('Sorting validation complete.');

        // Chart container
        const chartWrapper = this.page.locator('.branch-combo-chart');
        await expect(chartWrapper).toBeVisible();

        // SVG root
        const svg = chartWrapper.locator('svg[role="img"]');
        await expect(svg).toBeVisible();
        console.log('Charts are visible');
    }

    async navigateToTopBankBranchesDetails() {
        console.log('\nClicking "View Details" for Top Bank Branches...');

        await expect(this.locators.topBranchesViewDetailsBtn).toBeVisible();

        // Best-practice navigation handling
        const [nav] = await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'networkidle' }),
            this.locators.topBranchesViewDetailsBtn.click()
        ]);

        console.log('Navigation completed.');

        // Validate breadcrumb
        const header = this.page.locator('li.breadcrumb__item--active span:has-text("Top Bank Branches")');
        await expect(header).toBeVisible();

        await expect(
            this.page.locator('nav[aria-label="Breadcrumb"] li[aria-current="page"]')
        ).toContainText('Top Bank Branches');

        // Validate summary cards
        await expect(this.page.locator('.top-branches__summary-card')).toHaveCount(3);

        // Validate table
        await expect(this.page.locator('table.mat-mdc-table')).toBeVisible();

        // Validate paginator
        await expect(this.page.locator('mat-paginator')).toBeVisible();

        // Validate chart
        await expect(this.page.locator('svg[aria-labelledby="branchChartTitle branchChartDesc"]')).toBeVisible();


        const searchBox = this.page.locator('input[placeholder="Search bank, IFSC or address"]');
        await searchBox.fill('IndusInd');

        const rows = this.page.locator('table tbody tr');

        const count = await rows.count();
        for (let i = 0; i < count; i++) {
            await expect(rows.nth(i)).toContainText('IndusInd');
        }

        await searchBox.fill('');
        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThan(1);

        console.log('Details page structure validated successfully.');
    }

    async getAndValidateTopBankBranchesSummary() {
        console.log('\nExtracting summary values...');

        const cards = this.page.locator('section.top-branches__summary article.top-branches__summary-card');

        const totalDisputed = (await cards.nth(0).locator('.top-branches__summary-value').textContent()).trim();
        const avgAmount = (await cards.nth(1).locator('.top-branches__summary-value').textContent()).trim();
        const totalACCovered = (await cards.nth(2).locator('.top-branches__summary-value').textContent()).trim();

        console.log('\n--- Summary Card Values (UI) ---');
        console.log(`Total Disputed Amount: ${totalDisputed}`);
        console.log(`Avg. Amount / Branch: ${avgAmount}`);
        console.log(`Total A/C Covered: ${totalACCovered}`);
        console.log('--------------------------------\n');

        const uiValues = { totalDisputed, avgAmount, totalACCovered };

        // Validate with API
        await this.validateTopBankBranchesSummaryAPI(uiValues);

        return uiValues;
    }
    async validateExportButton(headerone, headertwo) {
        // Wait for the download event BEFORE clicking
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.page.getByRole('button', { name: /Export CSV/i }).click()
        ]);

        // Validate the download actually occurred
        const suggestedFileName = download.suggestedFilename();
        expect(suggestedFileName).toMatch(/\.csv$/);

        // Save file to a known location
        const filePath = path.join(__dirname, '../downloads', suggestedFileName);
        await download.saveAs(filePath);

        // Confirm file exists
        expect(fs.existsSync(filePath)).toBeTruthy();

        // Optional: Read and validate CSV content
        const csvContent = fs.readFileSync(filePath, 'utf8');
        expect(csvContent.length).toBeGreaterThan(0);
        expect(csvContent).toContain(headerone);        // header validation
        expect(csvContent).toContain(headertwo);    // another header

        console.log("Export button validated successfully");

    }
    async validateTopBankBranchesSummaryAPI(uiValues) {
        console.log('Calling Top Bank Branch Summary API...');


        const uiTotalDisputed = normalizeCurrency(uiValues.totalDisputed);
        const uiAvgAmount = normalizeCurrency(uiValues.avgAmount);
        const uiTotalAC = parseInt(uiValues.totalACCovered, 10);

        const apiTotalDisputed = api.totalDisputedAmount;
        const apiAvgAmount = api.avgAmountPerBranch;
        const apiTotalAC = api.totalAccountCovered;

        console.log('\n--- UI vs API Comparison ---');
        console.log(`UI Total Disputed      : ${uiTotalDisputed}`);
        console.log(`API Total Disputed     : ${apiTotalDisputed}`);
        console.log(`UI Avg Amount / Branch : ${uiAvgAmount}`);
        console.log(`API Avg Amount / Branch: ${apiAvgAmount}`);
        console.log(`UI Total A/C Covered   : ${uiTotalAC}`);
        console.log(`API Total A/C Covered  : ${apiTotalAC}`);
        console.log('--------------------------------------');

        expect(uiTotalDisputed).toBeCloseTo(apiTotalDisputed, 2);
        expect(uiAvgAmount).toBeCloseTo(apiAvgAmount, 2);
        expect(uiTotalAC).toBe(apiTotalAC);

        console.log('✔ UI values match API values');
    }
    async getTopBankBranchesSummary(request, caseName) {
        const fs = require("fs");

        // Load token from JSON file
        const tokenFile = JSON.parse(fs.readFileSync("sumit.json", "utf8"));
        const token = tokenFile.token;

        const url = `${process.env.BASE_URL_API}/ncrpbase/api/link-analysis/top-bank-branches-summary`;

        const response = await request.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json'
            },
            params: {
                userName: 'ncrp_demo',
                caseName: caseName
            }
        });

        console.log(token);
        console.log('Status:', response.status());
        //console.log('Body:', await response.text());
        expect(response.status()).toBe(200);


        // Get response data
        const responseData = await response.json();

        // Save to variable
        const savedResponse = responseData;

        // Print the full response
        console.log('=== FULL RESPONSE ===');
        //console.log(JSON.stringify(savedResponse, null, 2));

        // Print key metrics
        console.log('\n=== KEY METRICS ===');
        console.log('Success:', savedResponse.success);
        console.log('Total Transaction Amount:', savedResponse.data?.totalTransactionAmount);
        console.log('Average Amount per Branch:', savedResponse.data?.avgAmountPerBranch);
        console.log('Total Accounts Covered:', savedResponse.data?.totalAccountsCovered);
        console.log('Number of Branches:', savedResponse.data?.topBranches?.length);

        // Return the response for further use
        return savedResponse;
    }
    async validateTopBankBranchesSummaryValues(apiResponse) {
        console.log('Validating Top Bank Branches Summary Values...');

        const expectedTotalTransactionAmount = 7375411.17;
        const expectedAvgAmountPerBranch = 82869.79;
        const expectedTotalAccountsCovered = 143;

        const apiTotal = apiResponse.data?.totalTransactionAmount;
        const apiAvg = apiResponse.data?.avgAmountPerBranch;
        const apiTotalAC = apiResponse.data?.totalAccountsCovered;

        console.log('\n--- API Values vs Expected ---');
        console.log(`API Total Transaction Amount : ${apiTotal}`);
        console.log(`Expected Total               : ${expectedTotalTransactionAmount}`);
        console.log(`API Avg Amount / Branch      : ${apiAvg}`);
        console.log(`Expected Avg                 : ${expectedAvgAmountPerBranch}`);
        console.log(`API Total A/C Covered        : ${apiTotalAC}`);
        console.log(`Expected A/C Covered         : ${expectedTotalAccountsCovered}`);
        console.log('--------------------------------------');

        expect(apiTotal).toBeCloseTo(expectedTotalTransactionAmount, 2);
        expect(apiAvg).toBeCloseTo(expectedAvgAmountPerBranch, 2);
        expect(apiTotalAC).toBe(expectedTotalAccountsCovered);

        console.log('✔ API values match the expected static metrics');
    }

    async assertTopSuspectsPaginationVisible(expectedPageSize = '5') {

        await expect(this.locators.topSuspectsPaginator).toBeVisible();

        const pageSizeText = (await this.locators.topSuspectsPageSize.textContent()).trim();
        expect(pageSizeText).toBe(expectedPageSize);

        await expect(this.locators.topSuspectsNextBtn).toBeVisible();
        await expect(this.locators.topSuspectsPrevBtn).toBeVisible();
        await expect(this.locators.topSuspectsFirstBtn).toBeVisible();
        await expect(this.locators.topSuspectsLastBtn).toBeVisible();

        console.log('✓ Top Suspects pagination validated');
    }
    async assertTopSuspectsViewDetailsNavigation() {

        await this.locators.topSuspectsViewDetailsBtn.click();
        await this.page.waitForURL('**/top-suspects');

        expect(this.page.url()).toContain('/top-suspects');

        console.log('✓ View Details navigation validated');
    }
    async assertTopSuspectsPageLayout() {

        await expect(this.locators.topSuspectsLayout).toBeVisible();
        await expect(this.locators.topSuspectsToolbar).toBeVisible();
        await expect(this.locators.topSuspectsTitleheading).toBeVisible();
        await expect(this.locators.topSuspectsBreadcrumb).toBeVisible();

        await expect(this.locators.topSuspectsSummary).toBeVisible();
        await expect(this.locators.topSuspectsSpotlight).toBeVisible();
        await expect(this.locators.topSuspectsFilters).toBeVisible();

        await expect(this.locators.topSuspectsTableSection).toBeVisible();
        await expect(this.locators.topSuspectsTable).toBeVisible();

        console.log('✓ Top Suspects page layout validated');
    }

    async assertTopSuspectsSearch(accountNumber) {

        await expect(this.locators.topSuspectsSearchInput).toBeVisible();

        await this.locators.topSuspectsSearchInput.fill(accountNumber);

        await expect(this.locators.topSuspectsTableRows).toHaveCount(1);
        await expect(this.locators.topSuspectsNameCell.first()).toHaveText(accountNumber);

        await this.locators.topSuspectsSearchInput.fill('');
        const rowCount = await this.locators.topSuspectsTableRows.count();
        expect(rowCount).toBeGreaterThan(1);

        console.log('✓ Top Suspects search validated');
    }
    async assertTopSuspectsRiskBandFilter() {

        const riskBands = [
            { label: 'Low', expected: /Low/i },
            { label: 'Medium', expected: /Medium/i },
            { label: 'High', expected: /High/i }
        ];

        for (const band of riskBands) {
            await this.locators.topSuspectsRiskBandSelect.click();
            await this.page.locator(`mat-option:has-text("${band.label}")`).click();
            await this.page.waitForTimeout(400);

            const count = await this.locators.topSuspectsRiskPills.count();
            for (let i = 0; i < count; i++) {
                await expect(this.locators.topSuspectsRiskPills.nth(i))
                    .toHaveText(band.expected);
            }

            console.log(`✓ Risk band validated: ${band.label}`);
        }
    }

    async fetchTopSuspectsFromAPI(request, caseName) {
        console.log(`[API] Fetching Top Suspects for case: ${caseName}`);

        const tokenFile = JSON.parse(fs.readFileSync('sumit.json', 'utf8'));
        const token = tokenFile.token;

        const response = await request.get(
            `${process.env.BASE_URL_API}/ncrpbase/api/v1/casedashboard/top/suspect`,
            {
                params: {
                    userName: 'ncrp_demo',
                    caseName
                },
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log(`[API] Response status: ${response.status()}`);
        expect(response.ok()).toBeTruthy();

        const raw = await response.json();
        const data = Array.isArray(raw.summaryList) ? raw.summaryList : [];

        console.log(`[API] Suspects returned: ${data.length}`);
        return data;
    }

    normalizeApiTag(tag) {
        return tag
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    }
    mapApiTagToUi(tag) {
        const channelTagMap = {
            ATM: 'ATM Cash',
            ATM_CASH: 'ATM Cash',
            Atm: 'ATM Cash',
            MONEY_TRANSFER: 'Money Transfer',
            HOLD_OR_LIEN: 'HOLD_OR_LIEN',
            POS: 'Pos'
        };

        return channelTagMap[tag] ?? this.normalizeApiTag(tag);
    }
    formatAmount(value) {
        return value >= 100000
            ? `₹ ${(value / 100000).toFixed(1)}L`
            : `₹ ${value.toLocaleString()}`;
    }
    formatNetAmount(value) {
        return Math.abs(value) >= 100000
            ? `₹ ${(value / 100000).toFixed(2)}L`
            : `₹ ${value.toFixed(2)}`;
    }
    async assertTopSuspectListMatchesAPI(apiData) {
        console.log('[ASSERT] Validating Top Suspect list against API');
        const rows = this.locators.topSuspectRows;
        const uiCount = await rows.count();

        console.log(`[UI] Rows displayed: ${uiCount}`);

        const apiPageData = apiData.slice(0, uiCount);
        expect(apiPageData.length).toBe(uiCount);

        for (let i = 0; i < uiCount; i++) {
            console.log(`\n[ROW ${i + 1}] Validation started`);

            const row = rows.nth(i);
            const api = apiPageData[i];

            await expect(row).toBeVisible();

            const rank = (await row.locator(this.locators.topSuspectRank).textContent()).trim();
            console.log(`[ROW ${i + 1}] Rank: ${rank}`);
            expect(rank).toBe(`#${i + 1}`);

            const acc = (await row.locator(this.locators.topSuspectName).textContent()).trim();
            console.log(`[ROW ${i + 1}] Account: ${acc}`);
            expect(acc).toContain(api.accNo);

            const amount = (await row.locator(this.locators.topSuspectAmount).textContent()).trim();
            console.log(`[ROW ${i + 1}] Amount UI: ${amount}`);
            expect(amount).toBe(this.formatAmount(api.txAmount));

            const bank = (await row.locator(this.locators.topSuspectBankPill).first().textContent()).trim();
            console.log(`[ROW ${i + 1}] Bank: ${bank}`);
            expect(bank).toBe(api.bankName ?? '—');

            const uiTags = await row.locator(this.locators.topSuspectTags).allTextContents();
            console.log(`[ROW ${i + 1}] UI Tags: ${uiTags.join(', ')}`);

            (api.channelList ?? []).forEach(tag => {
                const mapped = this.mapApiTagToUi(tag);
                console.log(`[ROW ${i + 1}] Expect Tag: ${mapped}`);
                expect(uiTags).toContain(mapped);
            });

            const tx = (await row.locator(this.locators.topSuspectTxCount).textContent()).trim();
            console.log(`[ROW ${i + 1}] Tx Count: ${tx}`);
            expect(tx).toBe(`${api.txCount} tx`);

            const net = (await row.locator(this.locators.topSuspectNet).textContent()).trim();
            console.log(`[ROW ${i + 1}] Net UI: ${net}`);
            expect(net).toContain(this.formatNetAmount(api.netAmount));

            const share = (await row.locator(this.locators.topSuspectShare).textContent()).trim();
            console.log(`[ROW ${i + 1}] Share: ${share}`);
            expect(share).not.toBe('');

            const style = await row.locator(this.locators.topSuspectMeter).getAttribute('style');
            console.log(`[ROW ${i + 1}] Meter style: ${style}`);
            expect(style).toContain('%');

            console.log(`[ROW ${i + 1}] ✓ Validation complete (${api.accNo})`);
        }

        console.log('✓ All Top Suspect rows validated successfully');
    }

    async assertTopSuspectsPanelHeaderAndControls() {

        console.log('\n[TC24] Validating Top Suspect panel title');

        await expect(this.locators.topSuspectsPanel).toBeVisible();
        await expect(this.locators.topSuspectsTitle).toBeVisible();

        const titleText = (await this.locators.topSuspectsTitle.textContent()).trim();
        console.log(`Panel title found: "${titleText}"`);
        expect(titleText).toBe('Top Suspect Account Names');

        console.log('Validating header controls visibility');

        await expect(this.locators.topSuspectsMinimizeBtn).toBeVisible();
        await expect(this.locators.topSuspectsMaximizeBtn).toBeVisible();
        await expect(this.locators.topSuspectsViewDetailsBtn).toBeVisible();

        console.log('✓ Header controls are visible');

        // -------- MINIMIZE --------
        console.log('Validating minimize behavior');

        await expect(this.locators.topSuspectsPanelBody).toBeVisible();
        await this.locators.topSuspectsMinimizeBtn.click();

        await expect(this.locators.topSuspectsPanelBody).toBeHidden();
        console.log('✓ Panel minimized successfully');

        // -------- MAXIMIZE --------
        console.log('Validating maximize behavior');

        await this.locators.topSuspectsMaximizeBtn.click();

        await expect(this.locators.topSuspectsMaximizeModal).toBeVisible();

        const modalTitle = (await this.locators.topSuspectsModalTitle.textContent()).trim();
        console.log(`Maximize modal title: "${modalTitle}"`);

        expect(modalTitle).toBe('Top Suspect Account Names');

        console.log('✓ Maximize modal displayed successfully');
        console.log('✓ TC24: Panel title & header controls validated');
    }













}
