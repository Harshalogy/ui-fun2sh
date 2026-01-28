const { expect } = require('@playwright/test');
const DashboardLocators = require("../locators/DashboardLocators");

class UrgentFreezesPage {
    constructor(page) {
        this.page = page;
        this.locators = new DashboardLocators(page);
    }

    // ==================== TABLE & ROW METHODS ====================
    async waitForRows(timeout = 8000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const count = await this.locators.urgentFreezesRows.count();
            if (count > 0) return count;
            await this.page.waitForTimeout(400);
        }
        return 0;
    }

    async getRowCount() {
        return this.locators.urgentFreezesRows.count();
    }

    async getRowText(i) {
        return (await this.locators.urgentFreezesRows.nth(i).innerText()).replace(/\s+/g, " ").trim();
    }

    async getAllRows(limit = 10) {
        const total = await this.getRowCount();
        const max = Math.min(limit, total);
        const result = [];
        for (let i = 0; i < max; i++) {
            result.push(await this.getRowText(i));
        }
        return result;
    }

    async getCellText(rowIndex, columnIndex) {
        const cell = this.locators.getUrgentFreezesCell(rowIndex, columnIndex);
        return (await cell.innerText()).trim();
    }

    async getRowData(rowIndex) {
        return {
            accountNumber: await this.getCellText(rowIndex, 1),
            bankName: await this.getCellText(rowIndex, 2),
            amount: await this.getCellText(rowIndex, 3)
        };
    }

    async allRowsContain(value) {
        const count = await this.getRowCount();
        for (let i = 0; i < count; i++) {
            const text = await this.getRowText(i);
            if (!text.includes(value)) return false;
        }
        return true;
    }

    // ==================== SEARCH METHODS ====================
    async search(value) {
        await this.locators.urgentFreezesSearchInput.fill(value);
        await this.page.waitForTimeout(1500);
        
        if (await this.locators.urgentFreezesLoadingIndicator.count() > 0) {
            await this.locators.urgentFreezesLoadingIndicator.waitFor({ state: 'hidden' });
        }
    }

    async clearSearch() {
        await this.locators.urgentFreezesSearchInput.fill('');
        await this.page.waitForTimeout(800);
    }

    async waitForSearchResults() {
        await this.page.waitForTimeout(1500);
        return this.waitForRows();
    }

    async getSearchSuggestions() {
        const suggestions = this.locators.urgentFreezesSearchSuggestions;
        const count = await suggestions.count();
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(await suggestions.nth(i).innerText());
        }
        return result;
    }

    // ==================== PAGINATION METHODS ====================
    async paginatorCount() {
        return this.locators.urgentFreezesPaginators.count();
    }

    paginator(i = 0) {
        return this.locators.urgentFreezesPaginators.nth(i);
    }

    paginatorRange(i = 0) {
        return this.locators.urgentFreezesPaginatorRange(i);
    }

    nextBtn(i = 0) {
        return this.locators.urgentFreezesNextBtn(i);
    }

    prevBtn(i = 0) {
        return this.locators.urgentFreezesPrevBtn(i);
    }

    // ==================== HELPER METHODS ====================
    async getItemsPerPageOptions() {
        if (await this.locators.urgentFreezesItemsPerPageSelect.count() > 0) {
            await this.locators.urgentFreezesItemsPerPageSelect.click();
            await this.page.waitForTimeout(500);
            
            const options = this.locators.urgentFreezesItemsPerPageOptions;
            const optionCount = await options.count();
            const result = [];
            
            for (let i = 0; i < optionCount; i++) {
                result.push(await options.nth(i).innerText());
            }
            
            await this.page.keyboard.press('Escape');
            await this.page.waitForTimeout(300);
            
            return result;
        }
        return [];
    }

    async getCurrentItemsPerPage() {
        if (await this.locators.urgentFreezesCurrentItemsPerPage.count() > 0) {
            return await this.locators.urgentFreezesCurrentItemsPerPage.innerText();
        }
        return null;
    }

    async isHeaderVisible() {
        return await this.locators.urgentFreezesHeader.isVisible();
    }

    async isTableVisible() {
        return await this.locators.urgentFreezesTable.isVisible();
    }

    async getHeaderText() {
        return await this.locators.urgentFreezesHeader.textContent();
    }

    async getSearchPlaceholder() {
        return await this.locators.urgentFreezesSearchInput.getAttribute('placeholder');
    }

    async getColumnHeaderText(columnNameOrRegex) {
        const column = this.locators.getUrgentFreezesColumn(columnNameOrRegex);
        if (await column.count() > 0) {
            return await column.textContent();
        }
        return null;
    }

    async getPaginatorInfo(i = 0) {
        const rangeText = await this.paginatorRange(i).textContent();
        const hasNext = await this.nextBtn(i).isEnabled();
        const hasPrev = await this.prevBtn(i).isEnabled();
        
        return {
            range: rangeText?.trim(),
            hasNext,
            hasPrev
        };
    }
}

module.exports = UrgentFreezesPage;