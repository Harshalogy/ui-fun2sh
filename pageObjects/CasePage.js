// pageObjects/CasePage.js
const { expect } = require('@playwright/test');
const DashboardLocators = require('../locators/DashboardLocators');

exports.CasePage = class CasePage {
    constructor(page) {
        this.page = page;
        this.locators = new DashboardLocators(page);
    }

    // Helper method for dynamic table header
    tableHeader(headerText) {
        return this.page.locator(`app-case-list-widget th.mat-mdc-header-cell:has-text("${headerText}")`).first();
    }
    
    // Helper method for wizard step label
    wizardStepLabel(text) {
        return this.page.locator('.wizard__step-label', { hasText: text }).first();
    }

    // GENERAL UTILITY
    async closeVisualizationPopupIfVisible() {
        await this.page.locator('mat-dialog-container button[aria-label="Close visualization"] mat-icon')
            .click()
            .catch(() => { });
    }

    // NEW CASE BUTTON
    isNewCaseButtonVisible() {
        return this.locators.newCaseBtn.isVisible();
    }

    async getNewCaseButtonText() {
        return (await this.locators.newCaseBtn.innerText()).trim();
    }

    async isNewCaseIconVisible() {
        return this.locators.newCaseIcon.isVisible();
    }

    async getNewCaseIconText() {
        return (await this.locators.newCaseIcon.innerText()).trim();
    }

    // LIST HEADER + CAPTION
    isListHeaderVisible() {
        return this.locators.listHeader.isVisible();
    }

    async getListHeaderText() {
        return (await this.locators.listHeader.innerText()).trim();
    }

    async getCaptionTextOrNull() {
        if (await this.locators.captionLocator.count() === 0) return null;
        return (await this.locators.captionLocator.innerText()).trim();
    }

    // SEARCH FIELD
    isSearchInputVisible() {
        return this.locators.searchInput.isVisible();
    }

    async getSearchPlaceholder() {
        return await this.locators.searchInput.getAttribute("placeholder");
    }

    async searchFor(text) {
        await this.locators.searchInput.fill(text);
        await this.locators.searchInput.press("Enter");
        await this.waitForRows();
    }

    // TABLE HEADERS / COUNT
    async headerExists(headerText) {
        return (await this.tableHeader(headerText).count()) > 0;
    }

    async getTotalCountText() {
        if (await this.locators.totalCountLocator.count() === 0) return "";
        return (await this.locators.totalCountLocator.innerText()).trim();
    }

    // TABLE ROWS
    async getRowCount() {
        return await this.locators.caseTableRows.count();
    }

    async getRowText(index) {
        return (await this.locators.caseTableRows.nth(index).innerText()).replace(/\s+/g, " ").trim();
    }

    async getFirstRowText() {
        if (await this.locators.caseTableRows.count() === 0) return "";
        return (await this.locators.caseTableRows.first().innerText()).replace(/\s+/g, " ").trim();
    }

    async waitForRows(timeoutMs = 8000) {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            const count = await this.getRowCount();
            if (count > 0) return count;
            await this.page.waitForTimeout(500);
        }
        return 0;
    }

    // PAGINATION API
    async getPaginatorCount() {
        return this.locators.paginators.count();
    }

    getPaginator(n = 0) {
        return this.locators.paginators.nth(n);
    }

    getPaginatorNextBtn(paginator) {
        return paginator.locator("button.mat-mdc-paginator-navigation-next");
    }

    getPaginatorPrevBtn(paginator) {
        return paginator.locator("button.mat-mdc-paginator-navigation-previous");
    }

    getPaginatorRangeLabel(paginator) {
        return paginator.locator(".mat-mdc-paginator-range-label");
    }

    async getPageRangeText(paginator) {
        return (await this.getPaginatorRangeLabel(paginator).innerText()).trim();
    }

    getItemsPerPageTrigger(paginator) {
        return paginator.locator(".mat-mdc-paginator-page-size .mat-mdc-select-trigger");
    }

    async goToNextPage(paginator) {
        const next = this.getPaginatorNextBtn(paginator);
        if (await next.isEnabled()) {
            await next.click();
            await this.page.waitForTimeout(500);
            return true;
        }
        return false;
    }

    async goToPrevPage(paginator) {
        const prev = this.getPaginatorPrevBtn(paginator);
        if (await prev.isEnabled()) {
            await prev.click();
            await this.page.waitForTimeout(500);
            return true;
        }
        return false;
    }

    async goToLastPage(paginator) {
        let safety = 30;
        while (await this.getPaginatorNextBtn(paginator).isEnabled() && safety-- > 0) {
            await this.goToNextPage(paginator);
        }
    }

    async getItemsPerPageOptions() {
        return await this.page.locator("mat-option").allInnerTexts();
    }

    async selectItemsPerPageOption(index) {
        await this.page.locator("mat-option").nth(index).click();
        await this.page.waitForTimeout(800);
    }

    // FULLSCREEN
    async openFullscreenIfAvailable() {
        if (await this.locators.fullscreenOpenBtn.count()) {
            await this.locators.fullscreenOpenBtn.click();
            await this.locators.fullscreenContainer.waitFor({ state: "visible", timeout: 8000 });
            return true;
        }
        return false;
    }

    async closeFullscreenIfOpen() {
        if (await this.locators.fullscreenCloseBtn.count()) {
            await this.locators.fullscreenCloseBtn.click();
            await this.locators.fullscreenContainer.waitFor({ state: "hidden", timeout: 8000 });
            return true;
        }
        return false;
    }

    // DROPDOWN HELPERS
    async selectDropdownByLabel(labelText, optionRegex) {
        const all = this.page.getByLabel(labelText);
        const count = await all.count();
        if (count === 0) throw new Error(`Dropdown with label "${labelText}" not found`);
        
        const select = count === 1 ? all.first() : all.nth(1);
        await select.click({ timeout: 8000 });
        
        const option = this.page.getByRole('option', { name: optionRegex }).first();
        await option.click();
    }

    async selectDropdownFirstOption(labelText) {
        const select = this.page.getByLabel(labelText).first();
        await select.click();
        const first = this.page.getByRole('option').first();
        await first.click();
    }

    // MENU NAVIGATION
    isCaseMenuVisible() {
        return this.locators.caseMenu.isVisible();
    }

    async clickCaseMenuViaEval() {
        await this.page.evaluate((el) => el.click(), await this.locators.caseMenu.elementHandle());
    }

    // NEW CASE MODAL + WIZARD
    async openNewCaseModal() {
        await this.locators.newCaseBtn.click();
        await this.locators.newCaseModalTitle.waitFor({ state: "visible", timeout: 5000 });
    }

    async isNewCaseModalVisible() {
        return this.locators.newCaseModalTitle.isVisible();
    }

    async fillBasicDetails(details = {}) {
        if (details.caseName) await this.locators.caseNameInput.fill(details.caseName);
        if (details.complaintNo) await this.locators.complaintInput.fill(details.complaintNo);
        if (details.unit) await this.locators.unitInput.fill(details.unit);
        if (details.investigator) await this.locators.investigatorInput.fill(details.investigator);
        if (details.description) await this.locators.descriptionInput.fill(details.description);
    }

    async clickBack() {
        const back = this.page.getByRole('button', { name: /^back$/i });
        await back.click();
    }

    clickNext() {
        return this.locators.nextBtn.click();
    }

    clickCancel() {
        return this.locators.cancelBtn.click();
    }

    async getStatusSelectCount() {
        return this.locators.statusSelects.count();
    }

    getStatusSelect(index) {
        return this.locators.statusSelects.nth(index);
    }

    async openStatusDropdown(index) {
        await this.getStatusSelect(index).click();
    }

    getStatusOptions() {
        return this.page.locator("mat-option");
    }

    async getStatusOptionTexts() {
        const opts = this.getStatusOptions();
        const count = await opts.count();
        const list = [];
        for (let i = 0; i < count; i++) {
            list.push((await opts.nth(i).innerText()).trim());
        }
        return list;
    }

    async selectStatusOptionByIndex(index) {
        const opts = this.getStatusOptions();
        await opts.nth(index).click();
        await this.page.waitForTimeout(500);
    }

    getCaseTable() {
        return this.page.locator("app-case-list-widget table").first();
    }

    getTableRowsFromTable(tableLocator) {
        return tableLocator.locator("tbody tr");
    }

    async getStatusCellFromRow(rowLocator) {
        return rowLocator.locator("td").nth(5); // status column index
    }

    async tryOpenFullscreen() {
        if (await this.locators.fullscreenOpenBtn.count()) {
            await this.locators.fullscreenOpenBtn.click();
            await this.locators.fullscreenContainer.waitFor({ state: 'visible', timeout: 8000 });
            return true;
        }
        return false;
    }

    async tryCloseFullscreen() {
        if (await this.locators.fullscreenCloseBtn.count()) {
            await this.locators.fullscreenCloseBtn.click();
            await this.locators.fullscreenContainer.waitFor({ state: 'hidden', timeout: 8000 });
            return true;
        }
        return false;
    }

    // CASE NAME INPUT METHODS
    getCaseNameInput() {
        return this.locators.caseNameInput;
    }

    async setCaseName(value) {
        await this.locators.caseNameInput.fill(value);
        // Trigger validation by clicking on another field
        await this.locators.basicDetailsText.click();
        await this.page.waitForTimeout(300);
    }

    // COMPLAINT INPUT METHODS
    getComplaintInput() {
        return this.locators.complaintInput;
    }

    async blurComplaintInput() {
        await this.locators.complaintInput.click();
    }

    // NEXT & CANCEL METHODS
    isNextEnabled() {
        return this.locators.nextBtn.isEnabled();
    }

    async expectNextDisabled() {
        await expect(this.locators.nextBtn).toBeDisabled();
    }

    async expectNextEnabled() {
        await expect(this.locators.nextBtn).toBeEnabled();
    }

    // VALIDATION ERRORS
    getCaseNameSpaceError() {
        return this.locators.caseNameSpaceError;
    }

    getCaseNameRequiredError() {
        return this.locators.caseNameRequiredError;
    }

    // MODAL METHODS
    async closeModal() {
        await this.locators.cancelBtn.click();
    }

    async modalNotVisible() {
        await expect(this.locators.newCaseModalTitle).not.toBeVisible({ timeout: 3000 });
    }

    async getCaseNameLinkFromRow(rowIndex = 0) {
        const row = this.locators.caseTableRows.nth(rowIndex);
        return row.locator("td").nth(1).locator("a");
    }

    async clickCaseNameAndWait(rowIndex = 0) {
        const link = await this.getCaseNameLinkFromRow(rowIndex);
        await link.click();
        await this.page.waitForURL(/case|details|investigation/i, { timeout: 8000 });
        return this.page.url();
    }

    async getCaseNameText(rowIndex = 0) {
        const link = await this.getCaseNameLinkFromRow(rowIndex);
        return (await link.innerText()).trim();
    }

    // MENU VALIDATION HELPERS
    async getCaseMenuAriaDisabled() {
        return await this.locators.caseMenu.getAttribute("aria-disabled");
    }

    async getCaseMenuClass() {
        return await this.locators.caseMenu.getAttribute("class");
    }

    isCaseMenuContainerVisible() {
        return this.locators.caseMenuContainer.isVisible();
    }

    getCaseMenuContainerExpandBtn() {
        return this.locators.caseMenuContainer.locator("button.expand-toggle");
    }
};