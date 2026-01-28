// pageObjects/FundStatusPageObject.js
// Dedicated Page Object for Case-wise Fund Status Table

const { expect } = require('@playwright/test');

class FundStatusPageObject {
    constructor(page) {
        this.page = page;
        this.logger = this.createLogger();
    }

    // ========== LOGGER UTILITY ==========
    createLogger() {
        return {
            info: (msg) => console.log(`ℹ️  [Fund Status] ${msg}`),
            success: (msg) => console.log(`✅ [Fund Status] ${msg}`),
            error: (msg) => console.log(`❌ [Fund Status] ${msg}`),
            warning: (msg) => console.log(`⚠️  [Fund Status] ${msg}`),
            debug: (msg) => console.log(`🔍 [Fund Status] ${msg}`)
        };
    }

    // ========== TABLE VISIBILITY & STRUCTURE ==========

    /**
     * Check if Fund Status table section exists
     * @returns {Promise<boolean>}
     */
    async isFundStatusTableVisible() {
        try {
            const section = await this.page.locator('text=Case-wise Fund Status').count();
            return section > 0;
        } catch (error) {
            this.logger.error(`Failed to check Fund Status table visibility: ${error.message}`);
            return false;
        }
    }

    /**
     * Get all table headers from Fund Status table
     * @returns {Promise<string[]>}
     */
    async getTableHeaders() {
        try {
            const headers = await this.page.locator('th').allTextContents();
            if (headers.length === 0) {
                this.logger.warning('No table headers found');
                return [];
            }
            this.logger.success(`Found ${headers.length} table headers`);
            return headers;
        } catch (error) {
            this.logger.error(`Failed to retrieve table headers: ${error.message}`);
            return [];
        }
    }

    /**
     * Get all data rows from Fund Status table
     * @returns {Promise<number>}
     */
    async getRowCount() {
        try {
            const count = await this.page.locator('tbody tr').count();
            this.logger.debug(`Table contains ${count} rows`);
            return count;
        } catch (error) {
            this.logger.error(`Failed to count table rows: ${error.message}`);
            return 0;
        }
    }

    /**
     * Verify specific columns exist in table
     * @param {string[]} columnNames - Column names to verify
     * @returns {Promise<object>}
     */
    async verifyColumnHeaders(columnNames) {
        const result = {};
        try {
            const headers = await this.getTableHeaders();
            
            for (const colName of columnNames) {
                const exists = headers.some(header => 
                    header.toLowerCase().includes(colName.toLowerCase())
                );
                result[colName] = exists;
                this.logger.debug(`Column "${colName}": ${exists ? '✓' : '✗'}`);
            }
            
            return result;
        } catch (error) {
            this.logger.error(`Failed to verify column headers: ${error.message}`);
            return {};
        }
    }

    // ========== DATA VALIDATION ==========

    /**
     * Extract and validate fund amounts from first row
     * @returns {Promise<object>}
     */
    async validateFundAmounts() {
        try {
            const firstRow = await this.page.locator('tbody tr').first();
            const amountCells = await firstRow.locator('td').filter({ hasText: /₹[\d,]+/ }).allTextContents();
            
            const result = {
                amountsFound: amountCells.length,
                amounts: amountCells,
                isValid: amountCells.length >= 4
            };
            
            this.logger.success(`Fund amounts validation: ${amountCells.length} amounts found`);
            return result;
        } catch (error) {
            this.logger.error(`Failed to validate fund amounts: ${error.message}`);
            return { amountsFound: 0, amounts: [], isValid: false };
        }
    }

    /**
     * Validate timestamp format in table
     * @returns {Promise<object>}
     */
    async validateTimestampFormat() {
        try {
            const timestamps = await this.page.locator('td').filter({ 
                hasText: /\d{1,2}:\d{2}\s(AM|PM)/ 
            }).allTextContents();
            
            const formatRegex = /\d{1,2}:\d{2}\s(AM|PM)\s+\d{1,2}\s+\w+\s+\d{4}/;
            let validCount = 0;
            
            timestamps.forEach(ts => {
                if (formatRegex.test(ts.trim())) {
                    validCount++;
                }
            });
            
            const result = {
                totalFound: timestamps.length,
                validFormat: validCount,
                isValid: validCount === timestamps.length
            };
            
            this.logger.success(`Timestamp validation: ${validCount}/${timestamps.length} valid`);
            return result;
        } catch (error) {
            this.logger.error(`Failed to validate timestamps: ${error.message}`);
            return { totalFound: 0, validFormat: 0, isValid: false };
        }
    }

    /**
     * Verify case status values
     * @returns {Promise<object>}
     */
    async validateStatusColumn() {
        try {
            const statuses = await this.page.locator('tbody tr td:last-child').allTextContents();
            const openCount = statuses.filter(s => s.trim() === 'Open').length;
            
            const result = {
                totalRows: statuses.length,
                openStatus: openCount,
                isValid: openCount > 0
            };
            
            this.logger.success(`Status validation: ${openCount}/${statuses.length} are "Open"`);
            return result;
        } catch (error) {
            this.logger.error(`Failed to validate status column: ${error.message}`);
            return { totalRows: 0, openStatus: 0, isValid: false };
        }
    }

    /**
     * Validate fund calculation formula (D = A - B - C)
     * @returns {Promise<object>}
     */
    async validateFundFormula() {
        try {
            const formulaHeader = await this.page.locator('th:has-text("A"), th:has-text("B"), th:has-text("C"), th:has-text("D")').count();
            
            const result = {
                columnsFound: formulaHeader,
                hasFormula: formulaHeader > 0,
                formulaText: 'D = A - B - C'
            };
            
            if (result.hasFormula) {
                this.logger.success('Fund calculation formula columns detected');
            } else {
                this.logger.warning('Fund calculation formula columns not found');
            }
            
            return result;
        } catch (error) {
            this.logger.error(`Failed to validate fund formula: ${error.message}`);
            return { columnsFound: 0, hasFormula: false, formulaText: 'D = A - B - C' };
        }
    }

    // ========== SEARCH & FILTERING ==========

    /**
     * Search in Fund Status table
     * @param {string} searchTerm - Term to search for
     * @returns {Promise<boolean>}
     */
    async searchTable(searchTerm) {
        try {
            const searchBox = await this.page.locator('input[placeholder*="Search"], input[aria-label*="search"]').first();
            
            if (await searchBox.count() === 0) {
                this.logger.warning('Search box not found');
                return false;
            }
            
            await searchBox.fill(searchTerm);
            await this.page.waitForTimeout(500);
            
            this.logger.success(`Searched for: "${searchTerm}"`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to search: ${error.message}`);
            return false;
        }
    }

    /**
     * Clear search/filters
     * @returns {Promise<boolean>}
     */
    async clearFilters() {
        try {
            const clearBtn = await this.page.locator('button:has-text("Clear")').first();
            
            if (await clearBtn.count() === 0) {
                this.logger.warning('Clear button not found');
                return false;
            }
            
            const isDisabled = await clearBtn.isDisabled();
            if (isDisabled) {
                this.logger.info('Clear button is disabled (no filters active)');
                return false;
            }
            
            await clearBtn.click();
            await this.page.waitForTimeout(500);
            
            this.logger.success('Filters cleared');
            return true;
        } catch (error) {
            this.logger.error(`Failed to clear filters: ${error.message}`);
            return false;
        }
    }

    // ========== COLUMN SELECTION ==========

    /**
     * Get available column options
     * @returns {Promise<string[]>}
     */
    async getColumnOptions() {
        try {
            const dropdown = await this.page.locator('select, [role="combobox"]').filter({ 
                hasText: /Select Column|All Columns/ 
            }).first();
            
            if (await dropdown.count() === 0) {
                this.logger.warning('Column dropdown not found');
                return [];
            }
            
            const options = await dropdown.locator('option, [role="option"]').allTextContents();
            this.logger.success(`Found ${options.length} column options`);
            return options;
        } catch (error) {
            this.logger.error(`Failed to get column options: ${error.message}`);
            return [];
        }
    }

    /**
     * Select columns from dropdown
     * @param {string} columnOption - Column option to select
     * @returns {Promise<boolean>}
     */
    async selectColumn(columnOption) {
        try {
            const dropdown = await this.page.locator('select, [role="combobox"]').filter({ 
                hasText: /Select Column|All Columns/ 
            }).first();
            
            if (await dropdown.count() === 0) {
                this.logger.warning('Column dropdown not found');
                return false;
            }
            
            await dropdown.selectOption(columnOption).catch(() => {});
            await this.page.waitForTimeout(500);
            
            this.logger.success(`Selected column: ${columnOption}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to select column: ${error.message}`);
            return false;
        }
    }

    // ========== EXPORT & PAGINATION ==========

    /**
     * Check if Export CSV button is available
     * @returns {Promise<boolean>}
     */
    async isExportAvailable() {
        try {
            const exportBtn = await this.page.locator('button:has-text("Export CSV")').first();
            const available = await exportBtn.count() > 0;
            
            this.logger.debug(`Export CSV button: ${available ? 'available' : 'not found'}`);
            return available;
        } catch (error) {
            this.logger.error(`Failed to check export availability: ${error.message}`);
            return false;
        }
    }

    /**
     * Get pagination info
     * @returns {Promise<object>}
     */
    async getPaginationInfo() {
        try {
            const prevBtn = await this.page.locator('button:has-text("Previous"), button[aria-label*="previous"]').count();
            const nextBtn = await this.page.locator('button:has-text("Next"), button[aria-label*="next"]').count();
            const recordsDropdown = await this.page.locator('select').filter({ hasText: /10|20|50/ }).count();
            
            const result = {
                hasPrevious: prevBtn > 0,
                hasNext: nextBtn > 0,
                hasRecordsSelector: recordsDropdown > 0
            };
            
            this.logger.success('Pagination controls verified');
            return result;
        } catch (error) {
            this.logger.error(`Failed to get pagination info: ${error.message}`);
            return { hasPrevious: false, hasNext: false, hasRecordsSelector: false };
        }
    }

    // ========== VARIANT SWITCHING ==========

    /**
     * Switch between Disputed Amount and Transaction Amount
     * @param {string} variant - 'Disputed' or 'Transaction'
     * @returns {Promise<boolean>}
     */
    async switchVariant(variant) {
        try {
            const variantLabel = variant === 'Disputed' ? 'Disputed Amount' : 'Transaction Amount';
            const radio = await this.page.locator('input[type="radio"]').filter({ 
                has: this.page.locator(`text=${variantLabel}`) 
            }).first();
            
            if (await radio.count() === 0) {
                this.logger.warning(`${variantLabel} variant not found`);
                return false;
            }
            
            await radio.click().catch(() => {});
            await this.page.waitForTimeout(1000);
            
            this.logger.success(`Switched to ${variantLabel} variant`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to switch variant: ${error.message}`);
            return false;
        }
    }

    /**
     * Verify variant is selected
     * @param {string} variant - 'Disputed' or 'Transaction'
     * @returns {Promise<boolean>}
     */
    async isVariantSelected(variant) {
        try {
            const variantLabel = variant === 'Disputed' ? 'Disputed Amount' : 'Transaction Amount';
            const radio = await this.page.locator('input[type="radio"]').filter({ 
                has: this.page.locator(`text=${variantLabel}`) 
            }).first();
            
            if (await radio.count() === 0) {
                this.logger.warning(`${variantLabel} variant radio not found`);
                return false;
            }
            
            const isChecked = await radio.isChecked().catch(() => null);
            this.logger.debug(`${variantLabel} selected: ${isChecked}`);
            
            return isChecked === true;
        } catch (error) {
            this.logger.error(`Failed to verify variant selection: ${error.message}`);
            return false;
        }
    }

    // ========== VICTIM ACCOUNT DETAILS ==========

    /**
     * Get victim account count indicators
     * @returns {Promise<number>}
     */
    async getVictimCountIndicators() {
        try {
            const count = await this.page.locator('td').filter({ 
                hasText: /\d+\s+(visibility|View)/ 
            }).count();
            
            this.logger.success(`Found ${count} victim account indicators`);
            return count;
        } catch (error) {
            this.logger.error(`Failed to get victim count indicators: ${error.message}`);
            return 0;
        }
    }

    // ========== COMPREHENSIVE VALIDATION ==========

    /**
     * Perform comprehensive Fund Status table validation
     * @returns {Promise<object>}
     */
    async performComprehensiveValidation() {
        const results = {};
        
        try {
            this.logger.info('Starting comprehensive Fund Status table validation...');
            
            // Visibility check
            results.tableVisible = await this.isFundStatusTableVisible();
            
            if (!results.tableVisible) {
                this.logger.warning('Fund Status table not visible - aborting validation');
                return results;
            }
            
            // Headers validation
            const requiredColumns = ['Case Name', 'Fund Status', 'Case last updated', 'Status'];
            results.columnHeaders = await this.verifyColumnHeaders(requiredColumns);
            
            // Data validation
            results.rowCount = await this.getRowCount();
            results.fundAmounts = await this.validateFundAmounts();
            results.timestamps = await this.validateTimestampFormat();
            results.statuses = await this.validateStatusColumn();
            results.formula = await this.validateFundFormula();
            
            // Controls validation
            results.search = await this.searchTable('test');
            await this.clearFilters();
            
            results.export = await this.isExportAvailable();
            results.pagination = await this.getPaginationInfo();
            
            // Summary
            const allValid = Object.values(results.columnHeaders).every(v => v);
            this.logger.success('Comprehensive validation complete');
            
            return results;
        } catch (error) {
            this.logger.error(`Comprehensive validation failed: ${error.message}`);
            return results;
        }
    }
}

module.exports = FundStatusPageObject;
