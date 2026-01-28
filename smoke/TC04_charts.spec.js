const { test: base, expect } = require("@playwright/test");
const { AuthPage } = require("../../pageObjects/auth.page");
const { ChartsPage } = require("../../pageObjects/charts_page");
const { TokenHelperPage } = require("../../pageObjects/tokenHelper");

const BASE_URL = "http://148.113.0.204:23810";
const API_URL = "http://148.113.0.204:9464/authentication/api/v1/user/authenticate";

let auth = new AuthPage();

const test = base.extend({
  page: async ({ browser }, use) => {
    if (!auth.token) {
      await auth.loginByAPI(API_URL, "ncrp_demo", "ncrp_demo");
      await auth.prepareLocalStorage(BASE_URL);
    }

    const { context, page } = await auth.createAuthenticatedContext(browser);
    await page.goto(`${BASE_URL}/dashboard/io`);
    await use(page);
    await context.close();
  },
});

test.describe.skip("Charts - MO Timeline & Exit Mode (Dashboard)", () => {
  // ===============  1: MO TIMELINE EMPTY DATA TEST ===============
  test("1: MO Timeline chart loads with empty data (API mock)", async ({ page }) => {
    console.log("=== 1: MO TIMELINE EMPTY DATA TEST STARTED ===");

    const charts = new ChartsPage(page);

    await page.route("**/moTimeLineDetails", (route) => {
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });
    console.log("✅ API mock configured for empty response");

    await expect(charts.locators.moTimelineHeader).toBeVisible();
    console.log("✅ MO Timeline header visible");

    await expect(charts.locators.moTimelineChartContainer).toBeVisible();
    console.log("✅ MO Timeline chart container visible");

    console.log("=== 1: MO TIMELINE EMPTY DATA TEST COMPLETED ===\n");
  });

  // ===============  2: MO TIMELINE HEADER CARD & ERRORS ===============
  test("2: MO Timeline Header Card Chart renders without JS/console errors", async ({ page }) => {
    console.log("=== 2: MO TIMELINE ERROR CHECK TEST STARTED ===");

    const charts = new ChartsPage(page);
    const jsErrors = [];

    page.on("pageerror", (err) => jsErrors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") jsErrors.push(msg.text());
    });
    console.log("✅ Console error monitoring enabled");

    await expect(charts.locators.moTimelineCard).toBeVisible();
    console.log("✅ MO Timeline card visible");

    await expect(charts.locators.moTimelineHeader).toBeVisible();
    console.log("✅ MO Timeline header visible");

    await expect(charts.locators.moTimelineMaximizeBtn).toBeVisible();
    console.log("✅ MO Timeline maximize button visible");

    await expect(charts.locators.moTimelineChartContainer).toBeVisible();
    console.log("✅ MO Timeline chart container visible");

    expect(jsErrors.length).toBe(0);
    console.log("✅ No JavaScript errors found");

    console.log("=== 2: MO TIMELINE ERROR CHECK TEST COMPLETED ===\n");
  });

  // ===============  3: X AXIS TICK VALIDATION ===============
  test("3: MO Timeline X-axis ticks display correct dates", async ({ page }) => {
    console.log("=== 3: X-AXIS TICKS TEST STARTED ===");

    const charts = new ChartsPage(page);

    await charts.waitForChartVisible();
    console.log("✅ Chart visible");

    await expect(charts.locators.moTimelineXTicks.first()).toBeVisible({ timeout: 10000 });
    console.log("✅ X-axis ticks loaded");

    const xCount = await charts.locators.moTimelineXTicks.count();
    expect(xCount).toBeGreaterThan(0);
    console.log(`✅ X-axis ticks found: ${xCount}`);

    for (let i = 0; i < xCount; i++) {
      const dateText = (await charts.locators.moTimelineXTicks.nth(i).textContent()).trim();
      console.log(`  X tick ${i}: ${dateText}`);
      expect(dateText).toMatch(/\d{1,2}-\d{1,2}-\d{4}/);
    }
    console.log("✅ All X-axis ticks have valid date format");

    console.log("=== 3: X-AXIS TICKS TEST COMPLETED ===\n");
  });

  // ===============  4: Y AXIS TICK VALIDATION ===============
  test("4: MO Timeline Y-axis ticks display correct counts", async ({ page }) => {
    console.log("=== 4: Y-AXIS TICKS TEST STARTED ===");

    const charts = new ChartsPage(page);

    await charts.waitForChartVisible();
    console.log("✅ Chart visible");

    await charts.waitForMoTimelineLoaded();
    console.log("✅ SVG rendered");

    await expect(charts.locators.moTimelineYTicks.first()).toBeVisible({ timeout: 10000 });
    console.log("✅ Y-axis ticks loaded");

    await page.waitForTimeout(300);

    const yCount = await charts.locators.moTimelineYTicks.count();
    expect(yCount).toBeGreaterThan(0);
    console.log(`✅ Y-axis ticks found: ${yCount}`);

    for (let i = 0; i < yCount; i++) {
      const val = (await charts.locators.moTimelineYTicks.nth(i).textContent()).trim();
      console.log(`  Y Tick ${i}: ${val}`);
      expect(val).toMatch(/^\d+$/);
    }
    console.log("✅ All Y-axis ticks have valid numeric format");

    console.log("=== 4: Y-AXIS TICKS TEST COMPLETED ===\n");
  });

  // ===============  5: VISIBLE & HIDDEN BARS VALIDATION ===============
  test("5: MO Timeline chart - visible & hidden bars validation", async ({ page }) => {
    console.log("=== 5: BAR VISIBILITY TEST STARTED ===");

    const charts = new ChartsPage(page);

    await charts.waitForMoTimelineVisibleBars();
    console.log("✅ Chart bars loaded");

    const visibleCount = await charts.getMoTimelineVisibleBarCount();
    console.log(`✅ Visible bars found: ${visibleCount}`);
    expect(visibleCount).toBeGreaterThan(0);

    for (let i = 0; i < visibleCount; i++) {
      const ariaLabel = await charts.getMoTimelineVisibleBarAriaLabel(i);
      console.log(`  Visible bar [${i}]: ${ariaLabel.substring(0, 50)}...`);
      expect(ariaLabel).toMatch(/\d{1,2}-\d{1,2}-\d{4}/);
      expect(ariaLabel).toMatch(/[A-Za-z]/);
      expect(ariaLabel).toMatch(/\d+$/);
    }
    console.log("✅ All visible bars have valid aria labels");

    const hiddenCount = await charts.getMoTimelineHiddenBarCount();
    console.log(`ℹ️ Hidden bars found: ${hiddenCount}`);

    for (let i = 0; i < hiddenCount; i++) {
      const ariaLabel = await charts.getMoTimelineHiddenBarAriaLabel(i);
      console.log(`  Hidden bar [${i}]: ${ariaLabel.substring(0, 50)}...`);
      expect(ariaLabel).toBeTruthy();
    }

    console.log("=== 5: BAR VISIBILITY TEST COMPLETED ===\n");
  });

  // ===============  6: LEGEND COLORS MATCH BARS ===============
  test("6: MO Timeline legend colors match bar colors", async ({ page }) => {
    console.log("=== 6: LEGEND COLOR MATCH TEST STARTED ===");

    const charts = new ChartsPage(page);

    await charts.waitForMoTimelineVisibleBars();
    console.log("✅ Chart bars loaded");

    const barCount = await charts.locators.moTimelineAllBars.count();
    expect(barCount).toBeGreaterThan(0);
    console.log(`✅ Total bars found: ${barCount}`);

    console.log(`Checking legend colors for ${barCount} bars...`);

    for (let i = 0; i < barCount; i++) {
      const bar = charts.locators.moTimelineAllBars.nth(i);
      const typology = await charts.getMoTimelineBarTypology(bar);
      const fill = await charts.getMoTimelineBarColor(bar);
      const expected = charts.getExpectedLegendColorForTypology(typology);

      console.log(`  Bar ${i}: Typology=${typology}, Fill=${fill}, Expected=${expected}`);
      expect(expected, `Missing typology in legendColorMap: ${typology}`).toBeTruthy();
      expect(fill).toBe(expected);
    }
    console.log("✅ All bar colors match legend colors");

    console.log("=== 6: LEGEND COLOR MATCH TEST COMPLETED ===\n");
  });

  // ===============  7: UI VS API VALIDATION ===============
  test("7: MO Timeline - UI vs API Data Validation", async ({ page, request }) => {
    console.log("=== 7: UI VS API VALIDATION TEST STARTED ===");

    const charts = new ChartsPage(page);
    const tokenHelper = new TokenHelperPage(page, request);

    tokenHelper.startTokenCapture("/moTimeLineDetails");
    console.log("✅ Token capture configured");

    await page.goto("/dashboard/investigator");
    console.log("✅ Dashboard loaded");

    const popupClosed = await charts.closeVisualizationPopupIfVisible();
    console.log(popupClosed ? "ℹ️ Visualization popup closed" : "ℹ️ No popup appeared");

    const apiResponse = await tokenHelper.callMoTimelineAPI();
    const weeklyData = apiResponse?.data?.weeklyData || [];

    expect(weeklyData.length).toBeGreaterThan(0);
    console.log(`✅ API returned ${weeklyData.length} weekly data entries`);

    console.log("API weeklyData sample:", JSON.stringify(weeklyData.slice(0, 2), null, 2));

    await charts.validateMoTimelineUIAgainstAPI(weeklyData);
    console.log("✅ UI chart data matches API data");

    console.log("=== 7: UI VS API VALIDATION TEST COMPLETED ===\n");
  });

  // ===============  8: BAR HOVER TOOLTIP VALIDATION ===============
  test("8: MO Timeline bar hover shows tooltip with correct values", async ({ page }) => {
    console.log("=== 8: TOOLTIP VALIDATION TEST STARTED ===");

    const charts = new ChartsPage(page);

    await charts.waitForMoTimelineLoaded();
    console.log("✅ MO Timeline chart loaded");

    await charts.waitForMoTimelineVisibleBars();
    console.log("✅ Visible bars loaded");

    const bars = await charts.getMoTimelineAllVisibleBars();
    const visibleCount = bars.length;
    expect(visibleCount).toBeGreaterThan(0);
    console.log(`✅ Found ${visibleCount} visible bars for testing`);

    for (let i = 0; i < visibleCount; i++) {
      console.log(`  Testing tooltip for bar ${i + 1}/${visibleCount}`);
      const bar = bars[i];
      await bar.scrollIntoViewIfNeeded();
      await bar.hover({ force: true });

      const tooltip = charts.locators.pieTooltip;
      await expect(tooltip).toBeVisible({ timeout: 4000 });

      const text = (await tooltip.innerText()).trim();
      console.log(`    Tooltip text: ${text}`);

      const lines = text.split("\n").map((l) => l.trim());
      expect(lines.length).toBeGreaterThanOrEqual(2);

      const firstLine = lines[0];
      const secondLine = lines[1];

      const [dateStr, typology] = firstLine.split("•").map((x) => x.trim());

      expect(dateStr).toMatch(/^\d{2}-\d{2}-\d{4}$/);
      console.log(`    ✅ Date format valid: ${dateStr}`);

      expect(typology).toMatch(/^[A-Za-z0-9()\/&-,. ]+$/);
      console.log(`    ✅ Typology valid: ${typology}`);

      expect(secondLine).toMatch(/^\d+$/);
      console.log(`    ✅ Count value: ${secondLine}`);

      expect(Number(secondLine)).toBeGreaterThanOrEqual(1);

      await page.mouse.move(0, 0);
    }
    console.log("✅ All tooltips validated successfully");

    console.log("=== 8: TOOLTIP VALIDATION TEST COMPLETED ===\n");
  });

  // ===============  9: CHART EXPAND/COLLAPSE FUNCTIONALITY ===============
  test("9: MO Timeline chart expands and collapses correctly", async ({ page }) => {
    console.log("=== 9: CHART EXPAND/COLLAPSE TEST STARTED ===");

    const charts = new ChartsPage(page);

    await charts.waitForMoTimelineLoaded();
    const initialBarCount = await charts.getMoTimelineVisibleBarCount();
    console.log(`✅ Initial visible bar count: ${initialBarCount}`);
    expect(initialBarCount).toBeGreaterThan(0);

    console.log("Clicking maximize/expand button...");
    await charts.safeClick(charts.locators.moTimelineMaximizeBtn);
    console.log("✅ Maximize button clicked");

    await charts.waitForModalChartToLoad();

    const modalBarInfo = await charts.getModalBarCount();
    console.log(`Modal bars - Total: ${modalBarInfo.total}, Visible: ${modalBarInfo.visible}`);

    expect(modalBarInfo.visible).toBeGreaterThan(0);
    console.log(`ℹ️ Bar count comparison: Dashboard=${initialBarCount}, Modal=${modalBarInfo.visible}`);

    console.log("Closing expanded modal...");
    await charts.safeClick(charts.locators.modalCloseBtn);
    console.log("✅ Close button clicked");

    await expect(charts.locators.modalContainer).not.toBeVisible({ timeout: 10000 });
    console.log("✅ Modal closed");

    await expect(charts.locators.moTimelineChartContainer.first()).toBeVisible();
    console.log("✅ Dashboard chart visible");

    console.log("=== 9: CHART EXPAND/COLLAPSE TEST COMPLETED ===\n");
  });

  // ===============  10: EXIT MODE PIE CHART VISIBILITY ===============
  test("10: Exit Mode Pie Chart renders, all slices visible, and Sort By works", async ({ page }) => {
    console.log("=== 10: EXIT MODE PIE CHART TEST STARTED ===");

    const charts = new ChartsPage(page);

    const { slices } = await charts.validateExitModePieChart();
    console.log(`✅ Exit Mode pie chart validated with ${slices} slices`);

    console.log("=== 10: EXIT MODE PIE CHART TEST COMPLETED ===\n");
  });

  // ===============  11: EXIT MODE LEGEND VISIBILITY ===============
  test("11: Exit Mode legend entries render & are visible", async ({ page }) => {
    console.log("=== 11: EXIT MODE LEGEND TEST STARTED ===");

    const charts = new ChartsPage(page);
    await charts.locators.exitModePieChart.waitFor({ state: "visible", timeout: 15000 });
    await expect(charts.locators.exitModeLegendItems.first()).toBeVisible({ timeout: 10000 });
    console.log("✅ Legend entries loaded");

    const legendCount = await charts.locators.exitModeLegendItems.count();
    expect(legendCount).toBeGreaterThan(0);
    console.log(`✅ Total legend entries found: ${legendCount}`);

    for (let i = 0; i < legendCount; i++) {
      const row = charts.locators.exitModeLegendItems.nth(i);
      await expect(row).toBeVisible();

      const textEl = row.locator(".legend-label-text");
      const text = ((await textEl.textContent()) || "").trim();
      console.log(`  Legend ${i + 1}: ${text}`);
    }
    console.log("✅ All legend entries are visible");

    console.log("=== 11: EXIT MODE LEGEND TEST COMPLETED ===\n");
  });

  // ===============  12: LEGEND COLORS MATCH PIE SLICES ===============
  test("12: Exit Mode legend colors match pie slice colors", async ({ page }) => {
    console.log("===12: EXIT MODE COLOR MATCH TEST STARTED ===");

    const charts = new ChartsPage(page);

    await expect(charts.locators.widgetFund).toBeVisible({ timeout: 15000 });
    console.log("✅ Fund widget visible");

    await charts.validateLegendColors();
    console.log("✅ Legend colors match pie slice colors");

    console.log("=== 12: EXIT MODE COLOR MATCH TEST COMPLETED ===\n");
  });

  // ===============  13: PIE CHART TOOLTIP VALIDATION ===============
  test("13: Exit Mode pie chart tooltip displays correct values", async ({ page }) => {
    console.log("=== 13: PIE CHART TOOLTIP TEST STARTED ===");

    const charts = new ChartsPage(page);

    await charts.waitForPieSlices();
    console.log("✅ Pie slices loaded");

    const sliceCount = await charts.getPieSliceCount();
    expect(sliceCount).toBeGreaterThan(0);
    console.log(`✅ Total pie slices: ${sliceCount}`);

    for (let i = 0; i < sliceCount; i++) {
      console.log(`  Testing tooltip for slice ${i + 1}/${sliceCount}`);

      await charts.hoverPieSlice(i);
      await charts.waitForTooltip();

      const tooltipText = await charts.getTooltipText();
      console.log(`    Tooltip: ${tooltipText}`);

      expect(tooltipText.length).toBeGreaterThan(0);
      expect(tooltipText).toMatch(/[0-9]/);

      await page.mouse.move(2, 2);
    }
    console.log("✅ All pie slice tooltips validated");

    console.log("=== 13: PIE CHART TOOLTIP TEST COMPLETED ===\n");
  });

  // ===============  14: PIE CHART SVG VALIDATION ===============
  test("14: Exit Mode Chart renders correctly - SVG, arcs, labels, legend", async ({ page }) => {
    console.log("=== 14: PIE CHART RENDERING TEST STARTED ===");

    const charts = new ChartsPage(page);

    await charts.validatePieChartRendering();
    console.log("✅ Pie chart rendered correctly with all components");

    console.log("=== 14: PIE CHART RENDERING TEST COMPLETED ===\n");
  });

  // ===============  15: REQUIRED PIE LABELS CHECK ===============
  test("15: Exit Mode Check which pie chart labels are present", async ({ page }) => {
    console.log("=== 15: PIE CHART LABELS CHECK TEST STARTED ===");

    const charts = new ChartsPage(page);

    await charts.waitForPieSlices();
    console.log("✅ Pie chart loaded");

    await charts.locators.pieLabels.first().waitFor({ state: "visible", timeout: 10000 });

    const allLabelsCount = await charts.locators.pieLabels.count();
    console.log(`Total pie labels found: ${allLabelsCount}`);

    if (allLabelsCount > 0) {
      console.log("Actual labels found:");
      for (let i = 0; i < allLabelsCount; i++) {
        const labelText = await charts.locators.pieLabels.nth(i).textContent();
        console.log(`  [${i}] "${labelText?.trim()}"`);
      }
    }

    console.log(`\nChecking for ${charts.EXPECTED_PIE_LABELS.length} expected labels...`);

    for (const label of charts.EXPECTED_PIE_LABELS) {
      const check = charts.locators.pieLabels.filter({ hasText: label });
      const found = (await check.count()) > 0;
      console.log(`  ${label}: ${found ? "✅ FOUND" : "⚠️ MISSING"}`);

      if (!found) {
        const allLabelTexts = [];
        for (let i = 0; i < allLabelsCount; i++) {
          const text = await charts.locators.pieLabels.nth(i).textContent();
          allLabelTexts.push(text?.trim() || "");
        }

        const lowerLabel = label.toLowerCase();
        const similarLabels = allLabelTexts.filter(
          (text) => text.toLowerCase().includes(lowerLabel) || lowerLabel.includes(text.toLowerCase())
        );

        if (similarLabels.length > 0) {
          console.log(`    Similar found: ${similarLabels.join(", ")}`);
        }
      }
    }

    console.log("=== 15: PIE CHART LABELS CHECK TEST COMPLETED ===\n");
  });

  // ===============  16: EXIT MODE INSIGHT SORT BY VALIDATION ===============
  test("16: Exit Mode Insight - UI vs API + Tooltip Comparison", async ({ page, request }) => {
    console.log("=== 16: EXIT MODE INSIGHT VALIDATION TEST STARTED ===");

    const charts = new ChartsPage(page);
    const tokenHelper = new TokenHelperPage(page, request);

    tokenHelper.startTokenCapture("/exit-chart-data-all");
    console.log("✅ Token capture configured");

    await page.goto("/dashboard/investigator");
    console.log("✅ Dashboard loaded");

    const popupClosed = await charts.closeVisualizationPopupIfVisible();
    console.log(popupClosed ? "ℹ️ Visualization popup closed" : "ℹ️ No popup appeared");

    const apiData = await tokenHelper.callExitModeInsightAPI();
    console.log(`✅ API returned ${apiData.length} data entries`);

    const apiCategories = apiData.map((d) => d.category.trim());
    const uiLegends = await charts.getLegendTexts();

    expect(uiLegends.sort()).toEqual(apiCategories.sort());
    console.log("✅ Legends match API categories");

    await charts.validateExitModeInsight(apiData);
    console.log("✅ UI data matches API data");

    console.log("=== 16: EXIT MODE INSIGHT VALIDATION TEST COMPLETED ===\n");
  });

  // ===============  17: SORT BY OPTIONS VALIDATION ===============
  test("17: Selecting any Sort By option should not break fund-flow pie chart", async ({ page }) => {
    console.log("=== 17: SORT BY OPTIONS TEST STARTED ===");

    const charts = new ChartsPage(page);

    await page.goto("/dashboard/investigator");
    console.log("✅ Dashboard loaded");

    console.log(`Testing ${charts.EXIT_MODE_SORT_OPTIONS.length} sort options...`);

    for (const opt of charts.EXIT_MODE_SORT_OPTIONS) {
      console.log(`  Testing option: "${opt}"`);
      await charts.openSortByDropdown();
      await charts.selectSortOption(opt);

      expect(await charts.isPieChartVisible()).toBe(true);
      console.log("    ✅ Pie chart visible");

      const sliceCount = await charts.getPieSliceCount();
      expect(sliceCount).toBeGreaterThan(0);
      console.log(`    ✅ Found ${sliceCount} pie slices`);

      const legendCount = (await charts.getLegendTexts()).length;
      expect(legendCount).toBeGreaterThan(0);
      console.log(`    ✅ Found ${legendCount} legend entries`);

      console.log(`    ✅ Sort By "${opt}" works correctly`);
    }

    console.log("=== 17: SORT BY OPTIONS TEST COMPLETED ===\n");
  });

  // ===============  18: EXIT MODE EXPAND/COLLAPSE FUNCTIONALITY ===============
  test("18: Exit Mode Insights chart expands and collapses correctly", async ({ page }) => {
    console.log("=== 18: EXIT MODE EXPAND/COLLAPSE TEST STARTED ===");

    const charts = new ChartsPage(page);

    console.log("Waiting for Exit Mode pie chart to be visible...");
    await charts.locators.exitModePieChart.waitFor({ state: "visible", timeout: 15000 });
    console.log("✅ Exit Mode pie chart is visible");

    await charts.waitForPieSlices();
    const initialSliceCount = await charts.getPieSliceCount();
    console.log(`✅ Initial visible slice count: ${initialSliceCount}`);
    expect(initialSliceCount).toBeGreaterThan(0);

    console.log("Clicking maximize/expand button...");
    await charts.safeClick(charts.getExitModeExpandBtn());
    console.log("✅ Expand button clicked");

    console.log("Waiting for modal pie chart...");
    await charts.waitForModalPieChartToLoad(10000);

    const visibleModalSlices = await charts.getVisibleModalSliceCount();
    console.log(`✅ Visible slices in modal: ${visibleModalSlices}`);
    expect(visibleModalSlices).toBeGreaterThan(0);

    console.log("Closing modal...");
    await charts.safeClick(charts.locators.modalCloseBtn);
    console.log("✅ Close button clicked");

    await charts.locators.modalContainer.waitFor({ state: "hidden", timeout: 5000 });
    console.log("✅ Modal closed");

    console.log("Verifying dashboard Exit Mode chart is visible...");
    await expect(charts.locators.exitModePieChart).toBeVisible();

    const finalSliceCount = await charts.getPieSliceCount();
    console.log(`✅ Final visible slice count: ${finalSliceCount}`);
    expect(finalSliceCount).toBeGreaterThan(0);

    console.log("=== 18: EXIT MODE EXPAND/COLLAPSE TEST COMPLETED ===\n");
  });
});
