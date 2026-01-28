class RelatedCasesPage {
    constructor(page) {
        this.page = page;
        
        // Main panel
        this.panel = page.locator('article[data-area="related"]');
        this.header = this.panel.locator('header.viz-card__header h2');
        this.maximizeButton = this.panel.locator('button[aria-label="Maximize related cases"]');
        
        // Panel summary
        this.groupsCount = this.panel.locator('span.summary-stat:has-text("Groups")');
        this.casesCount = this.panel.locator('span.summary-stat:has-text("Cases")');
        
        // Search
        this.searchInput = this.panel.locator('input[placeholder*="Search cases or attributes"]');
        this.searchIcon = this.panel.locator('mat-icon[data-mat-icon-type="font"]:has-text("search")');
        
        // Group cards
        this.groupCards = this.panel.locator('mat-card.case-group-card');
        this.groupHeaders = this.panel.locator('.group-header');
        this.groupNumbers = this.panel.locator('.group-number');
        this.disputedAmounts = this.panel.locator('.disputed-amount');
        
        // Group attributes
        this.commonAttributes = this.panel.locator('.common-attribute');
        this.attributeLabels = this.panel.locator('.attribute-label');
        this.attributeValues = this.panel.locator('.attribute-value');
        
        // Case chips
        this.caseChips = this.panel.locator('mat-chip');
        this.caseChipSet = this.panel.locator('mat-chip-set');
        
        // Action buttons
        this.viewDetailsButtons = this.panel.locator('button:has-text("View Details")');
        
        // Paginator
        this.paginator = this.panel.locator('mat-paginator');
        this.itemsPerPageSelect = this.paginator.locator('mat-select');
        this.pageRangeLabel = this.paginator.locator('.mat-mdc-paginator-range-label');
        this.nextPageButton = this.paginator.locator('button[aria-label="Next page"]');
        this.previousPageButton = this.paginator.locator('button[aria-label="Previous page"]');
        this.firstPageButton = this.paginator.locator('button[aria-label="First page"]');
        this.lastPageButton = this.paginator.locator('button[aria-label="Last page"]');
        
        // Empty state
        this.emptyStateMessage = this.panel.locator('text=/no cases|no records|nothing found|no results|no matching/i');
        
        // Priority indicators
        this.priorityIndicators = this.panel.locator('.priority--low, .priority--medium, .priority--high');
        
        // ==================== MAXIMIZED DIALOG SELECTORS ====================
        this.maximizedDialog = page.locator('section.viz-dialog');
        this.dialogHeader = this.maximizedDialog.locator('header.viz-dialog__header h2');
        this.closeDialogButton = this.maximizedDialog.locator('button[aria-label="Close visualization"]');
        
        // Dialog search and filters
        this.dialogSearchInput = this.maximizedDialog.locator('input[placeholder*="Case ID, investigator, category"]');
        this.dialogStatusFilter = this.maximizedDialog.locator('mat-select[formcontrolname="status"]');
        
        // Dialog table
        this.dialogCaseTable = this.maximizedDialog.locator('table.case-table');
        this.dialogCaseRows = this.maximizedDialog.locator('tr.mat-mdc-row');
        this.dialogCaseLinks = this.maximizedDialog.locator('a.case-link');
        this.dialogTotalCount = this.maximizedDialog.locator('.total-count');
        this.dialogPaginator = this.maximizedDialog.locator('mat-paginator');
        
        // Dialog table columns
        this.dialogCaseIdCells = this.maximizedDialog.locator('td.cdk-column-caseId');
        this.dialogCaseNameCells = this.maximizedDialog.locator('td.cdk-column-caseName');
        this.dialogCreatedAtCells = this.maximizedDialog.locator('td.cdk-column-createdAt');
        this.dialogCategoryCells = this.maximizedDialog.locator('td.cdk-column-category');
        this.dialogPriorityCells = this.maximizedDialog.locator('td.cdk-column-priority');
        this.dialogStatusCells = this.maximizedDialog.locator('td.cdk-column-status');
    }

    // ==================== PANEL METHODS ====================
    async isPanelVisible() {
        return await this.panel.isVisible();
    }

    async getPanelHeaderText() {
        return await this.header.textContent();
    }

    async getSummaryStats() {
        const groups = await this.groupsCount.textContent();
        const cases = await this.casesCount.textContent();
        return { groups, cases };
    }

    async isSearchBarVisible() {
        return await this.searchInput.isVisible();
    }

    // ==================== GROUP CARDS METHODS ====================
    async getGroupCardCount() {
        return await this.groupCards.count();
    }

    async getGroupCardData(index = 0) {
        const card = this.groupCards.nth(index);
        
        const groupNumber = await card.locator('.group-number').textContent();
        const disputedAmount = await card.locator('.disputed-amount').textContent();
        const attributeLabel = await card.locator('.attribute-label').textContent();
        const attributeValue = await card.locator('.attribute-value').textContent();
        
        // Get case names
        const caseChips = card.locator('mat-chip');
        const caseCount = await caseChips.count();
        const cases = [];
        
        for (let i = 0; i < caseCount; i++) {
            const caseName = await caseChips.nth(i).textContent();
            cases.push(caseName.trim());
        }
        
        return {
            groupNumber: groupNumber?.trim(),
            disputedAmount: disputedAmount?.trim(),
            attributeLabel: attributeLabel?.trim(),
            attributeValue: attributeValue?.trim(),
            caseCount,
            cases
        };
    }

    async getAllGroupsData() {
        const count = await this.getGroupCardCount();
        const groups = [];
        
        for (let i = 0; i < count; i++) {
            const groupData = await this.getGroupCardData(i);
            groups.push(groupData);
        }
        
        return groups;
    }

    // ==================== SEARCH METHODS ====================
    async search(query) {
        await this.searchInput.fill(query);
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(500); // Wait for results to filter
    }

    async clearSearch() {
        await this.searchInput.fill('');
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(500);
    }

    // ==================== PAGINATOR METHODS ====================
    async getPaginatorInfo() {
        const rangeText = await this.pageRangeLabel.textContent();
        const isNextEnabled = !await this.nextPageButton.getAttribute('aria-disabled');
        const isPrevEnabled = !await this.previousPageButton.getAttribute('aria-disabled');
        
        return {
            rangeText: rangeText?.trim(),
            canGoNext: isNextEnabled === true,
            canGoPrev: isPrevEnabled === true
        };
    }

    async goToNextPage() {
        const paginatorInfo = await this.getPaginatorInfo();
        if (paginatorInfo.canGoNext) {
            await this.nextPageButton.click();
            await this.page.waitForTimeout(1000); // Wait for page transition
            return true;
        }
        return false;
    }

    async goToPreviousPage() {
        const paginatorInfo = await this.getPaginatorInfo();
        if (paginatorInfo.canGoPrev) {
            await this.previousPageButton.click();
            await this.page.waitForTimeout(1000);
            return true;
        }
        return false;
    }

    async changeItemsPerPage(optionText) {
        await this.itemsPerPageSelect.click();
        await this.page.waitForTimeout(300);
        
        const option = this.page.locator(`mat-option:has-text("${optionText}")`);
        await option.click();
        await this.page.waitForTimeout(1000); // Wait for reload
    }

    // ==================== DIALOG/MODAL METHODS ====================
    async maximizePanel() {
        try {
            // Click the maximize button
            await this.maximizeButton.click();
            await this.page.waitForTimeout(2000); // Wait for dialog to open
            
            // Wait for dialog to be visible
            await this.maximizedDialog.waitFor({ state: 'visible', timeout: 5000 });
            
            // Return true if dialog opened successfully
            return await this.maximizedDialog.isVisible();
        } catch (error) {
            console.log('Error maximizing panel:', error);
            return false;
        }
    }

    async restorePanel() {
        try {
            // Click the close button in the dialog
            await this.closeDialogButton.click();
            await this.page.waitForTimeout(1000); // Wait for dialog to close
            
            // Wait for dialog to be hidden
            await this.maximizedDialog.waitFor({ state: 'hidden', timeout: 5000 });
            
            // Return true if dialog closed successfully
            return !(await this.maximizedDialog.isVisible());
        } catch (error) {
            console.log('Error restoring panel:', error);
            return false;
        }
    }

    async isDialogVisible() {
        return await this.maximizedDialog.isVisible();
    }

    async getDialogData() {
        const dialogVisible = await this.maximizedDialog.isVisible();
        if (!dialogVisible) {
            return null;
        }
        
        const headerText = await this.dialogHeader.textContent();
        const totalCountText = await this.dialogTotalCount.textContent();
        const rowCount = await this.dialogCaseRows.count();
        
        // Get first few cases for verification
        const cases = [];
        const countToCheck = Math.min(rowCount, 5);
        
        for (let i = 0; i < countToCheck; i++) {
            const row = this.dialogCaseRows.nth(i);
            const caseId = await row.locator('td.cdk-column-caseId').textContent();
            const caseName = await row.locator('td.cdk-column-caseName').textContent();
            const createdAt = await row.locator('td.cdk-column-createdAt').textContent();
            const category = await row.locator('td.cdk-column-category').textContent();
            const priority = await row.locator('td.cdk-column-priority').textContent();
            const status = await row.locator('td.cdk-column-status').textContent();
            const caseLink = await row.locator('a.case-link').getAttribute('aria-label');
            
            cases.push({
                caseId: caseId?.trim(),
                caseName: caseName?.trim(),
                createdAt: createdAt?.trim(),
                category: category?.trim(),
                priority: priority?.trim(),
                status: status?.trim(),
                caseLink: caseLink
            });
        }
        
        return {
            headerText: headerText?.trim(),
            totalCountText: totalCountText?.trim(),
            visibleRowCount: rowCount,
            sampleCases: cases
        };
    }

    async searchInDialog(query) {
        await this.dialogSearchInput.fill(query);
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(1000); // Wait for results
    }

    async clearDialogSearch() {
        await this.dialogSearchInput.fill('');
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(1000);
    }

    async clickCaseInDialog(index = 0) {
        const caseLink = this.dialogCaseLinks.nth(index);
        await caseLink.click();
        await this.page.waitForTimeout(1000);
        return true;
    }

    async getDialogPaginatorInfo() {
        const dialogVisible = await this.maximizedDialog.isVisible();
        if (!dialogVisible) {
            return null;
        }
        
        const rangeLabel = this.maximizedDialog.locator('.mat-mdc-paginator-range-label');
        const rangeText = await rangeLabel.textContent();
        
        const nextBtn = this.maximizedDialog.locator('button[aria-label="Next page"]');
        const prevBtn = this.maximizedDialog.locator('button[aria-label="Previous page"]');
        
        const isNextEnabled = !(await nextBtn.getAttribute('aria-disabled'));
        const isPrevEnabled = !(await prevBtn.getAttribute('aria-disabled'));
        
        return {
            rangeText: rangeText?.trim(),
            canGoNext: isNextEnabled === true,
            canGoPrev: isPrevEnabled === true
        };
    }

    // ==================== VALIDATION HELPERS ====================
    async isViewDetailsButtonEnabled(index = 0) {
        const button = this.viewDetailsButtons.nth(index);
        return !await button.getAttribute('disabled');
    }

    async clickViewDetails(index = 0) {
        await this.viewDetailsButtons.nth(index).click();
        await this.page.waitForTimeout(500);
        return true;
    }

    async hasPriorityIndicators() {
        return await this.priorityIndicators.count() > 0;
    }

    async getPriorityForGroup(index = 0) {
        const card = this.groupCards.nth(index);
        const classes = await card.getAttribute('class');
        
        if (classes.includes('priority--low')) return 'low';
        if (classes.includes('priority--medium')) return 'medium';
        if (classes.includes('priority--high')) return 'high';
        return 'none';
    }

    // ==================== WAIT METHODS ====================
    async waitForDataLoad() {
        await this.page.waitForSelector('mat-card.case-group-card', { state: 'visible', timeout: 10000 });
        // Also wait for paginator if it exists
        if (await this.paginator.isVisible()) {
            await this.page.waitForSelector('.mat-mdc-paginator-range-label', { state: 'visible' });
        }
    }

    async waitForDialogToOpen(timeout = 5000) {
        await this.maximizedDialog.waitFor({ state: 'visible', timeout });
    }

    async waitForDialogToClose(timeout = 5000) {
        await this.maximizedDialog.waitFor({ state: 'hidden', timeout });
    }

    // ==================== UTILITY METHODS ====================
    async extractNumbersFromText(text) {
        const match = text?.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    }

    async getGroupSummaryStats() {
        const stats = await this.getSummaryStats();
        return {
            groups: await this.extractNumbersFromText(stats.groups),
            cases: await this.extractNumbersFromText(stats.cases)
        };
    }

    async verifyGroupCardStructure(index = 0) {
        const card = this.groupCards.nth(index);
        const hasGroupNumber = await card.locator('.group-number').isVisible();
        const hasDisputedAmount = await card.locator('.disputed-amount').isVisible();
        const hasAttribute = await card.locator('.common-attribute').isVisible();
        const hasCaseChips = await card.locator('mat-chip').first().isVisible().catch(() => false);
        const hasViewDetails = await card.locator('button:has-text("View Details")').isVisible();
        
        return {
            hasGroupNumber,
            hasDisputedAmount,
            hasAttribute,
            hasCaseChips,
            hasViewDetails,
            isValid: hasGroupNumber && hasDisputedAmount && hasAttribute && hasViewDetails
        };
    }
}

module.exports = RelatedCasesPage;