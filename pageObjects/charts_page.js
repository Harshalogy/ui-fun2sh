// pageObjects/charts_page.js
const { expect } = require("@playwright/test");
const DashboardLocators = require("../locators/DashboardLocators");

exports.ChartsPage = class ChartsPage {
    constructor(page) {
        this.page = page;
        this.locators = new DashboardLocators(page);

        // ---------- DATA ARRAYS ----------
        this.EXIT_MODE_SORT_OPTIONS = [
            "Transaction Count",
            "Transaction Amount",
            "Disputed Amount"
        ];

        this.EXPECTED_PIE_LABELS = [
            "POS",
            "AEPS",
            "ATM",
            "Cheque",
            "Withdrawal through CSPs"
        ];

        this.MO_TIMELINE_LEGEND_COLORS = {
            'cid': '#5B8DEF',
            'Complaint': '#FF8C69',
            'Demat/Depository Fraud': '#2E7D32',
            'Digital Arrest': '#FFB74D',
            'Internet Banking Related Fraud': '#8E24AA',
            'Online Shopping Fraud': '#26C6DA',
            'Payroll Fraud': '#5B8DEF',
            'Phishing Scam': '#FF8C69',
            'UPI Related Frauds': '#2E7D32'
        };
    }

    // ---------- DYNAMIC LOCATOR METHODS (ADD THESE) ----------

    getExitModeExpandBtn() {
        return this.locators.widgetFund.locator('button[aria-label="Maximize Exit Mode Insights"]').first();
    }

    getModalPieSlices() {
        return this.locators.modalContainer.locator('g[ngx-charts-pie-arc] g.arc-group path.arc');
    }

    getModalBars() {
        return this.locators.modalContainer.locator('app-mo-timeline-widget path.bar');
    }

    // ---------- MO TIMELINE METHODS ----------
    async waitForMoTimelineLoaded() {
        await this.locators.moTimelineChartContainer.waitFor({ state: 'visible', timeout: 8000 });
        await this.page.waitForSelector('app-mo-timeline-widget g[ngx-charts-series-vertical]', {
            timeout: 8000
        });
    }

    async waitForMoTimelineVisibleBars() {
        await this.page.waitForSelector('app-mo-timeline-widget .chart-container', { state: 'visible' });
        await this.page.waitForFunction(
            () => document.querySelectorAll('app-mo-timeline-widget .chart-container path.bar:not(.hidden)').length > 0,
            null,
            { timeout: 8000 }
        ).catch(() => console.log("⚠️ Visible bars did not load within timeout"));
    }

    async getMoTimelineVisibleBarCount() {
        return await this.locators.moTimelineVisibleBars.count();
    }

    async getMoTimelineHiddenBarCount() {
        return await this.locators.moTimelineHiddenBars.count();
    }

    async getMoTimelineVisibleBarAriaLabel(index) {
        return await this.locators.moTimelineVisibleBars.nth(index).getAttribute('aria-label');
    }

    async getMoTimelineHiddenBarAriaLabel(index) {
        return await this.locators.moTimelineHiddenBars.nth(index).getAttribute('aria-label');
    }

    async getMoTimelineAllVisibleBars() {
        const count = await this.locators.moTimelineAllBars.count();
        const visibleBars = [];

        for (let i = 0; i < count; i++) {
            const bar = this.locators.moTimelineAllBars.nth(i);
            const box = await bar.boundingBox();
            const isVisible = box && box.width > 2 && box.height > 2;

            if (isVisible) {
                visibleBars.push(bar);
            }
        }
        return visibleBars;
    }

    async getMoTimelineWeeklyGroupCount() {
        return await this.locators.moTimelineSeriesGroups.count();
    }

    async getMoTimelineXAxisLabels() {
        const count = await this.locators.moTimelineXAxisDates.count();
        const labels = [];
        for (let i = 0; i < count; i++) {
            labels.push((await this.locators.moTimelineXAxisDates.nth(i).textContent())?.trim());
        }
        return labels;
    }

    async getMoTimelineWeekBarsData(index) {
        const group = this.locators.moTimelineSeriesGroups.nth(index);
        const bars = group.locator('path.bar');
        const barCount = await bars.count();

        let total = 0;
        const uiCategoryData = [];

        for (let i = 0; i < barCount; i++) {
            const aria = (await bars.nth(i).getAttribute('aria-label')) || '';

            // Parse aria-label format: "10-11-2025 Complaint 12"
            const parts = aria.trim().split(/\s+/);

            if (parts.length >= 3) {
                const value = parseInt(parts[parts.length - 1], 10);
                const categoryParts = parts.slice(1, -1);
                const category = categoryParts.join(' ');

                if (Number.isFinite(value)) {
                    total += value;
                    uiCategoryData.push({
                        category,
                        value,
                        rawAria: aria
                    });
                }
            } else {
                console.warn(`Unexpected aria-label format: "${aria}"`);
            }
        }

        return { total, uiCategoryData };
    }

    async isMoTimelineLegendCategoryPresent(catName) {
        return (await this.locators.moTimelineLegendItems
            .filter({ hasText: catName })
            .count()) > 0;
    }

    async getMoTimelineBarTypology(barLocator) {
        const ariaLabel = await barLocator.getAttribute('aria-label');
        if (!ariaLabel) return null;

        const parts = ariaLabel.trim().split(/\s+/);
        if (parts.length >= 3) {
            return parts.slice(1, -1).join(' ');
        }
        return null;
    }

    async getMoTimelineBarColor(barLocator) {
        return await barLocator.getAttribute('fill');
    }

    getExpectedLegendColorForTypology(typology) {
        return this.MO_TIMELINE_LEGEND_COLORS[typology];
    }

    async validateMoTimelineWeek(index, apiWeekObj, uiLabel) {
        const { week: apiWeek, totalCount: apiTotal, categories: apiCats } = apiWeekObj;

        // Validate X-axis label
        expect(uiLabel).toContain(apiWeek);

        // Get all bars data for this week
        const { total: uiTotal, uiCategoryData } = await this.getMoTimelineWeekBarsData(index);

        console.log(`\n------ WEEK ${index} (${apiWeek}) ------`);
        console.log("UI Week Label:", uiLabel);
        console.log("API Total:", apiTotal);
        console.log("UI Total:", uiTotal);

        // Validate totals match
        expect(uiTotal, `Total mismatch @ week ${apiWeek}`).toBe(apiTotal);

        // Validate each category - CASE INSENSITIVE COMPARISON
        for (const apiCat of apiCats || []) {
            const apiCatName = apiCat.categoryName.trim();
            const apiCatNameLower = apiCatName.toLowerCase();

            // Look for the category in UI data (case insensitive)
            const uiMatch = uiCategoryData.find(c => {
                const uiCatLower = c.category.toLowerCase();
                return uiCatLower.includes(apiCatNameLower) ||
                    apiCatNameLower.includes(uiCatLower) ||
                    c.category.includes(apiCatName);
            });

            if (!uiMatch) {
                console.error(`\n❌ CATEGORY MISMATCH DETAILS:`);
                console.error(`API Category: "${apiCatName}" (count: ${apiCat.count})`);
                console.error(`Available UI Categories:`);
                uiCategoryData.forEach((cat, idx) => {
                    console.error(`  [${idx}] "${cat.category}" (value: ${cat.value})`);
                });
            }

            expect(uiMatch, `Missing category "${apiCatName}" @ week ${apiWeek}`).toBeTruthy();
            expect(uiMatch.value, `Value mismatch for "${apiCatName}" @ week ${apiWeek}`)
                .toBe(apiCat.count);
        }

        // Validate legend shows categories - CASE INSENSITIVE
        for (const apiCat of apiCats || []) {
            const apiCatName = apiCat.categoryName.trim();
            const apiCatNameLower = apiCatName.toLowerCase();

            const legendExists = await this.locators.moTimelineLegendItems
                .filter({ hasText: new RegExp(apiCatName, 'i') })
                .count()
                .then(count => count > 0);

            expect(legendExists, `Legend missing category "${apiCatName}"`).toBeTruthy();
        }

        console.log(`✅ Week ${apiWeek} validated successfully`);
    }

    async validateMoTimelineUIAgainstAPI(weeklyData) {
        await this.waitForMoTimelineLoaded();

        const uiLabels = await this.getMoTimelineXAxisLabels();
        const uiGroupCount = await this.getMoTimelineWeeklyGroupCount();

        expect(uiGroupCount).toBe(weeklyData.length);
        expect(uiLabels.length).toBe(weeklyData.length);

        // Loop and validate all weeks
        for (let i = 0; i < weeklyData.length; i++) {
            await this.validateMoTimelineWeek(i, weeklyData[i], uiLabels[i]);
        }
    }

    // ---------- EXIT MODE PIE METHODS ----------
    async openSortByDropdown() {
        await this.locators.exitModeSortBy.waitFor({ state: "visible" });
        await this.locators.exitModeSortBy.click();
        const panel = this.page.locator(".cdk-overlay-pane .mat-mdc-select-panel");
        await panel.waitFor({ state: "visible" });
    }

    async selectSortOption(option) {
        const panel = this.page.locator(".cdk-overlay-pane .mat-mdc-select-panel");
        await panel.getByRole("option", { name: option }).click();
        await this.page.waitForTimeout(1500);
    }

    async waitForPieSlices() {
        await this.locators.pieSlices.first().waitFor({ state: 'visible', timeout: 15000 });
    }

    async getPieSliceCount() {
        return await this.locators.pieSlices.count();
    }

    async hoverPieSlice(index) {
        const slice = this.locators.pieSlices.nth(index);
        await slice.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(100);
        await slice.hover({ force: true });
        await this.page.waitForTimeout(150);
    }

    async waitForTooltip() {
        await this.locators.pieTooltip.waitFor({ state: 'visible', timeout: 10000 });
    }

    async getTooltipText() {
        await this.waitForTooltip();
        return (await this.locators.pieTooltip.innerText()).trim();
    }

    async isPieChartVisible() {
        await this.locators.pieSvg.waitFor({ state: "visible", timeout: 7000 });
        return await this.locators.pieSvg.isVisible();
    }

    async getLegendTexts() {
        const texts = await this.locators.exitModeLegendItems.allTextContents();
        return texts.map(x => x.trim());
    }

    hexToRgb(hex) {
        const c = hex.replace('#', '');
        const r = parseInt(c.slice(0, 2), 16);
        const g = parseInt(c.slice(2, 4), 16);
        const b = parseInt(c.slice(4, 6), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }

    async validateLegendColors() {
        await this.waitForPieSlices();

        const sliceCount = await this.getPieSliceCount();
        const legendCount = await this.locators.exitModeLegendItems.count();

        console.log(`Slices: ${sliceCount}, Legends: ${legendCount}`);

        if (sliceCount !== legendCount) {
            throw new Error(`Slice count (${sliceCount}) does not match legend count (${legendCount})`);
        }

        for (let i = 0; i < sliceCount; i++) {
            const sliceHex = await this.locators.pieSlices.nth(i).evaluate(el => el.getAttribute('fill'));
            const sliceRgb = this.hexToRgb(sliceHex);

            const legendRgb = await this.locators.exitModeLegendItems
                .nth(i)
                .locator('.legend-label-color')
                .evaluate(el => getComputedStyle(el).backgroundColor);

            const label = await this.locators.exitModeLegendItems.nth(i).locator('.legend-label-text').innerText();

            console.log(`Slice ${i} (${label}): HEX=${sliceHex} → RGB=${sliceRgb}, Legend RGB=${legendRgb}`);

            if (legendRgb !== sliceRgb) {
                throw new Error(`Legend color mismatch for "${label}": expected ${sliceRgb}, got ${legendRgb}`);
            }
        }
    }

    async validatePieChartRendering() {
        // Wait for SVG
        await this.locators.pieSvg.waitFor({ state: 'visible', timeout: 10000 });

        // Validate arcs/slices
        const sliceCount = await this.locators.pieArcs.count();
        console.log("Pie slices count:", sliceCount);
        if (sliceCount === 0) throw new Error("No pie slices found in Exit Mode chart");

        // Validate labels
        await this.locators.pieLabels.first().waitFor({ state: 'visible', timeout: 8000 });
        const labelCount = await this.locators.pieLabels.count();
        console.log("Pie labels count:", labelCount);
        if (labelCount === 0) throw new Error("No pie labels found in Exit Mode chart");
        if (labelCount > sliceCount) throw new Error(`More labels (${labelCount}) than slices (${sliceCount})`);

        // Validate legend
        await this.locators.exitModeLegendItems.first().waitFor({ state: 'visible', timeout: 8000 });
        const legendCount = await this.locators.exitModeLegendItems.count();
        console.log("Legend items count:", legendCount);

        if (legendCount !== sliceCount) {
            throw new Error(`Legend count (${legendCount}) does not match slice count (${sliceCount})`);
        }
    }

    async validateExitModePieChart() {
        console.log("\n🔍 Validating Exit Mode pie chart...");

        await expect(this.locators.exitModeHeader).toBeVisible({ timeout: 15000 });
        console.log("✅ Exit Mode Insights header visible");

        await expect(this.locators.exitModeSortBy).toBeVisible();
        console.log("✅ Sort By dropdown visible");

        await expect(this.locators.exitModePieChart).toBeVisible();
        console.log("✅ Pie chart container visible");

        const sliceCount = await this.getPieSliceCount();
        console.log(`✅ Found ${sliceCount} pie slices`);
        expect(sliceCount).toBeGreaterThan(0);

        // Get slice names by hovering to trigger tooltips
        console.log("📋 Pie slice names:");

        for (let i = 0; i < sliceCount; i++) {
            try {
                // Hover slice to trigger tooltip
                await this.hoverPieSlice(i);
                await this.waitForTooltip();

                // Get tooltip text and extract slice name
                const tooltipText = await this.getTooltipText();
                const sliceName = tooltipText.split('\n')[0].trim();

                console.log(`   [${i + 1}] ${sliceName}`);

                // Move mouse away
                await this.page.mouse.move(2, 2);
                await this.page.waitForTimeout(100);

            } catch (error) {
                console.log(`   [${i + 1}] Error retrieving slice name: ${error.message}`);
            }
        }

        console.log("✅ Exit Mode pie chart validation completed");
        return { slices: sliceCount };
    }

    async validateExitModeInsight(apiData) {
        const clean = num => num.replace(/,/g, "");

        for (const sortOption of this.EXIT_MODE_SORT_OPTIONS) {
            console.log(`\n🔍 Validating Sort Option: ${sortOption}`);

            // Apply sort selection
            await this.openSortByDropdown();
            await this.selectSortOption(sortOption);
            await this.waitForPieSlices();

            const sliceCount = await this.getPieSliceCount();
            expect(sliceCount).toBeGreaterThan(0);

            // Validate each pie slice tooltip against API
            for (let i = 0; i < sliceCount; i++) {
                await this.hoverPieSlice(i);
                const tooltip = await this.getTooltipText();

                const [uiCategory, uiValueRaw] = tooltip.split("\n");
                const uiValue = clean(uiValueRaw.trim());

                const apiRecord = apiData.find(
                    d => d.category.trim() === uiCategory.trim()
                );

                expect(apiRecord, `API record missing for category: ${uiCategory}`).toBeTruthy();

                let expected;
                if (sortOption === "Transaction Count") {
                    expected = apiRecord.count.toString();
                } else if (sortOption === "Transaction Amount") {
                    expected = apiRecord.totalTxnAmount.toString();
                } else {
                    expected = apiRecord.totalDisputedAmount.toString();
                }

                // Remove trailing .00 if present
                expected = expected.replace(/\.0+$/, "");

                console.log(`   UI Value: ${uiValue}`);
                console.log(`   API Value: ${expected}`);

                expect(uiValue).toBe(expected);

                console.log(`   ✅ Tooltip validated for: ${uiCategory}`);
            }

            console.log(`✅ Sort option validated: ${sortOption}`);
        }
    }

    // ---------- COMMON METHODS ----------
    async closeVisualizationPopupIfVisible() {
        if (await this.locators.modalCloseBtn.count()) {
            try {
                await this.locators.modalCloseBtn.click({ timeout: 2000 });
                console.log("ℹ️ Visualization popup closed");
                return true;
            } catch (e) {
                console.log("ℹ️ Popup close button found but could not click, ignoring...");
                return false;
            }
        }
        return false;
    }

    async waitForChartVisible() {
        return this.locators.moTimelineChartContainer.waitFor({
            state: 'visible',
            timeout: 15000
        });
    }

    async waitForLoaderToDisappear(timeout = 10000) {
        try {
            if (await this.locators.loaderOverlay.isVisible({ timeout: 2000 })) {
                console.log("⏳ Waiting for loader to disappear...");
                await this.locators.loaderOverlay.waitFor({ state: 'hidden', timeout: timeout });
                console.log("✅ Loader disappeared");
                return true;
            }
        } catch (error) {
            // Loader not found or already hidden
        }
        return false;
    }

    async safeClick(locator, options = {}) {
        const defaultOptions = {
            timeout: 10000,
            ...options
        };

        console.log(`Attempting safe click on element...`);

        // 1. First wait for loader to disappear
        await this.waitForLoaderToDisappear(5000);

        // 2. Try normal click
        try {
            await locator.click(defaultOptions);
            console.log("✅ Normal click successful");
            return true;
        } catch (error) {
            console.log(`⚠️ Normal click failed: ${error.message}`);

            // 3. Try force click as fallback
            try {
                await locator.click({ ...defaultOptions, force: true });
                console.log("✅ Force click successful");
                return true;
            } catch (forceError) {
                console.log(`❌ Force click also failed: ${forceError.message}`);

                // 4. Last resort: try with longer timeout and retry
                console.log("Trying one more time with longer timeout...");
                await this.waitForLoaderToDisappear(10000);

                await locator.click({
                    timeout: 15000,
                    force: true
                });
                console.log("✅ Click successful after retry");
                return true;
            }
        }
    }

    // Wait for modal chart to load
    async waitForModalChartToLoad(timeout = 15000) {
        console.log("Waiting for modal chart to load...");

        // Wait for modal container
        await this.locators.modalContainer.waitFor({ state: 'visible', timeout });

        // Wait for the specific visualization dialog container
        await this.locators.modalVizDialog.waitFor({ state: 'visible', timeout });

        // Wait for the MO Timeline widget specifically
        await this.locators.modalMoTimelineWidget.waitFor({ state: 'visible', timeout });

        // Wait for the chart container inside the widget
        const modalChartContainer = this.locators.modalMoTimelineWidget.locator('.chart-container');
        await modalChartContainer.waitFor({ state: 'visible', timeout });

        // Wait for SVG
        const modalSvg = modalChartContainer.locator('svg');
        await modalSvg.waitFor({ state: 'visible', timeout });

        // Wait for bars to load with data
        await this.page.waitForFunction(() => {
            const bars = document.querySelectorAll('mat-dialog-container app-mo-timeline-widget path.bar');
            return bars.length > 0 &&
                Array.from(bars).some(bar => {
                    const aria = bar.getAttribute('aria-label');
                    return aria && aria.includes('-') && /\d+$/.test(aria);
                });
        }, { timeout });

        console.log("✅ Modal chart fully loaded");
    }

    async getModalBarCount() {
        const modalBars = this.getModalBars();

        // Wait for at least one bar
        try {
            await modalBars.first().waitFor({ state: 'visible', timeout: 10000 });
        } catch (error) {
            console.log("⚠️ No bars found yet, waiting a bit more...");
            await this.page.waitForTimeout(2000);
        }

        // Count total bars
        const totalCount = await modalBars.count();
        console.log(`Total bars in modal: ${totalCount}`);

        // Count visible bars
        let visibleCount = 0;
        for (let i = 0; i < totalCount; i++) {
            const bar = modalBars.nth(i);
            const isVisible = await bar.isVisible();
            if (isVisible) {
                visibleCount++;
            }
        }

        return { total: totalCount, visible: visibleCount };
    }

    async waitForModalPieChartToLoad(timeout = 15000) {
        console.log("Waiting for modal pie chart to load...");

        // Wait for modal container
        await this.locators.modalContainer.waitFor({ state: 'visible', timeout });

        // Wait for the specific pie chart in modal
        await this.locators.modalPieChart.waitFor({ state: 'visible', timeout });

        // Wait for pie slices
        const modalPieSlices = this.getModalPieSlices();
        await modalPieSlices.first().waitFor({ state: 'visible', timeout });

        console.log("✅ Modal pie chart loaded");
        return modalPieSlices;
    }

    // Method to count visible modal slices
    async getVisibleModalSliceCount() {
        const slices = this.getModalPieSlices();
        const count = await slices.count();
        let visibleCount = 0;

        for (let i = 0; i < count; i++) {
            if (await slices.nth(i).isVisible()) {
                visibleCount++;
            }
        }

        return visibleCount;
    }
};