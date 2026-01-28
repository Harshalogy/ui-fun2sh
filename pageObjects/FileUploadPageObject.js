// pageObjects/FileUploadPageObject.js
// NEW FILE - Dedicated File Upload Page Object Methods (DO NOT MODIFY EXISTING FILES)
// Created for comprehensive file upload testing

const FileUploadLocators = require('../locators/FileUploadLocators');

class FileUploadPageObject {
    constructor(page) {
        this.page = page;
        this.locators = new FileUploadLocators(page);
    }

    // ========== FILE UPLOAD STEP METHODS ==========

    /**
     * Check if Add Files button is visible
     * @returns {Promise<boolean>}
     */
    async isAddFilesBtnVisible() {
        return this.locators.addFilesBtn.count() > 0;
    }

    /**
     * Click on Add Files button to open file picker
     * @returns {Promise<void>}
     */
    async clickAddFilesBtn() {
        const btn = this.locators.addFilesBtn;
        if (await btn.count() > 0) {
            await btn.click();
            await this.page.waitForTimeout(500);
        }
    }

    /**
     * Upload a single file
     * @param {string} filePath - Full path to the file to upload
     * @returns {Promise<boolean>}
     */
    async uploadSingleFile(filePath) {
        try {
            const fileInput = this.locators.fileInputField;
            if (await fileInput.count() === 0) {
                throw new Error('File input element not found');
            }
            await fileInput.setInputFiles(filePath);
            await this.page.waitForTimeout(1000);
            return true;
        } catch (error) {
            console.error('File upload failed:', error.message);
            return false;
        }
    }

    /**
     * Upload multiple files
     * @param {string[]} filePaths - Array of file paths to upload
     * @returns {Promise<boolean>}
     */
    async uploadMultipleFiles(filePaths) {
        try {
            const fileInput = this.locators.fileInputField;
            if (await fileInput.count() === 0) {
                throw new Error('File input element not found');
            }
            await fileInput.setInputFiles(filePaths);
            await this.page.waitForTimeout(1500);
            return true;
        } catch (error) {
            console.error('Multiple file upload failed:', error.message);
            return false;
        }
    }

    /**
     * Get count of uploaded files displayed in UI
     * @returns {Promise<number>}
     */
    async getUploadedFileCount() {
        return this.locators.uploadedFileItems.count();
    }

    /**
     * Get array of uploaded file names
     * @returns {Promise<string[]>}
     */
    async getUploadedFileNames() {
        const fileNames = [];
        const fileItems = this.locators.uploadedFileItems;
        const count = await fileItems.count();

        for (let i = 0; i < count; i++) {
            const text = await fileItems.nth(i).innerText();
            fileNames.push(text.trim());
        }
        return fileNames;
    }

    /**
     * Check if a specific file is uploaded
     * @param {string} fileName - File name to check
     * @returns {Promise<boolean>}
     */
    async isFileUploaded(fileName) {
        const fileNames = await this.getUploadedFileNames();
        return fileNames.some(name => name.includes(fileName) || name.includes(fileName.split('.')[0]));
    }

    /**
     * Remove a specific uploaded file
     * @param {number} index - Index of file to remove
     * @returns {Promise<boolean>}
     */
    async removeFile(index = 0) {
        try {
            const removeBtns = this.locators.fileRemoveBtns;
            if (await removeBtns.count() > index) {
                await removeBtns.nth(index).click();
                await this.page.waitForTimeout(500);
                return true;
            }
            return false;
        } catch (error) {
            console.error('File removal failed:', error.message);
            return false;
        }
    }

    /**
     * Remove all uploaded files
     * @returns {Promise<boolean>}
     */
    async removeAllFiles() {
        try {
            let count = await this.getUploadedFileCount();
            while (count > 0) {
                await this.removeFile(0);
                count = await this.getUploadedFileCount();
                await this.page.waitForTimeout(300);
            }
            return true;
        } catch (error) {
            console.error('Remove all files failed:', error.message);
            return false;
        }
    }

    // ========== EXTRACT PDF CHECKBOX METHODS ==========

    /**
     * Check if Extract PDF checkbox is visible
     * @returns {Promise<boolean>}
     */
    async isExtractPdfCheckboxVisible() {
        return this.locators.extractPdfCheckbox.count() > 0;
    }

    /**
     * Get Extract PDF checkbox state
     * @returns {Promise<boolean>}
     */
    async isExtractPdfCheckboxChecked() {
        const checkbox = this.locators.extractPdfCheckbox;
        if (await checkbox.count() > 0) {
            return checkbox.isChecked();
        }
        return false;
    }

    /**
     * Toggle Extract PDF checkbox
     * @returns {Promise<boolean>}
     */
    async toggleExtractPdfCheckbox() {
        try {
            const checkbox = this.locators.extractPdfCheckbox;
            if (await checkbox.count() === 0) {
                return false;
            }
            const isChecked = await checkbox.isChecked();
            if (isChecked) {
                await checkbox.uncheck();
            } else {
                await checkbox.check();
            }
            await this.page.waitForTimeout(300);
            return true;
        } catch (error) {
            console.error('Toggle checkbox failed:', error.message);
            return false;
        }
    }

    /**
     * Set Extract PDF checkbox state
     * @param {boolean} shouldCheck - True to check, false to uncheck
     * @returns {Promise<boolean>}
     */
    async setExtractPdfCheckboxState(shouldCheck) {
        try {
            const checkbox = this.locators.extractPdfCheckbox;
            if (await checkbox.count() === 0) {
                return false;
            }
            if (shouldCheck) {
                await checkbox.check();
            } else {
                await checkbox.uncheck();
            }
            await this.page.waitForTimeout(300);
            return true;
        } catch (error) {
            console.error('Set checkbox state failed:', error.message);
            return false;
        }
    }

    // ========== UPLOAD STATUS MESSAGES ==========

    /**
     * Check if "No files selected" message is visible
     * @returns {Promise<boolean>}
     */
    async isNoFilesMessageVisible() {
        return this.locators.noFilesMessage.count() > 0;
    }

    /**
     * Get current upload status message
     * @returns {Promise<string|null>}
     */
    async getUploadStatusMessage() {
        if (await this.locators.uploadingMessage.count() > 0) {
            return 'uploading';
        }
        if (await this.locators.uploadSuccessMessage.count() > 0) {
            return 'success';
        }
        if (await this.locators.uploadErrorMessage.count() > 0) {
            return 'error';
        }
        if (await this.locators.noFilesMessage.count() > 0) {
            return 'no_files';
        }
        if (await this.locators.fileSelectedMessage.count() > 0) {
            return 'files_selected';
        }
        return null;
    }

    // ========== NAVIGATION METHODS ==========

    /**
     * Click Back button to go to previous step
     * @returns {Promise<boolean>}
     */
    async clickBackBtn() {
        try {
            const btn = this.locators.backBtn;
            if (await btn.count() > 0 && await btn.isEnabled()) {
                await btn.click();
                await this.page.waitForTimeout(500);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Back button click failed:', error.message);
            return false;
        }
    }

    /**
     * Click Next button to go to next step
     * @returns {Promise<boolean>}
     */
    async clickNextBtn() {
        try {
            const btn = this.locators.nextBtn;
            if (await btn.count() > 0 && await btn.isEnabled()) {
                await btn.click();
                await this.page.waitForTimeout(800);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Next button click failed:', error.message);
            return false;
        }
    }

    /**
     * Check if Next button is enabled
     * @returns {Promise<boolean>}
     */
    async isNextBtnEnabled() {
        const btn = this.locators.nextBtn;
        if (await btn.count() === 0) return false;
        return btn.isEnabled();
    }

    /**
     * Click Cancel button to close modal
     * @returns {Promise<boolean>}
     */
    async clickCancelBtn() {
        try {
            const btn = this.locators.cancelBtn;
            if (await btn.count() > 0) {
                await btn.click();
                await this.page.waitForTimeout(500);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Cancel button click failed:', error.message);
            return false;
        }
    }

    // ========== FILE STACK METHODS ==========

    /**
     * Check if file stack table is visible
     * @returns {Promise<boolean>}
     */
    async isFileStackTableVisible() {
        return this.locators.fileStackTable.count() >= 0;
        
    }

    /**
     * Get all table column headers
     * @returns {Promise<string[]>}
     */
    async getFileStackColumnHeaders() {
        const headers = [];
        const headerElements = this.locators.fileStackTableHeaders;
        const count = await headerElements.count();

        for (let i = 0; i < count; i++) {
            const text = await headerElements.nth(i).innerText();
            if (text.trim()) {
                headers.push(text.trim());
            }
        }
        return headers;
    }

    /**
     * Get count of rows in file stack table
     * @returns {Promise<number>}
     */
    async getFileStackRowCount() {
        return this.locators.fileStackTableRows.count();
    }

    /**
     * Get data from a specific row
     * @param {number} rowIndex - Index of row
     * @returns {Promise<Object>}
     */
    async getFileStackRowData(rowIndex) {
        const row = this.locators.fileStackTableRows.nth(rowIndex);
        const cells = row.locator('td');
        const cellCount = await cells.count();
        const data = {};

        const headers = await this.getFileStackColumnHeaders();
        for (let i = 0; i < cellCount && i < headers.length; i++) {
            const cellText = await cells.nth(i).innerText();
            data[headers[i]] = cellText.trim();
        }
        return data;
    }

    // ========== FILE STACK SEARCH METHODS ==========

    /**
     * Search in file stack
     * @param {string} searchTerm - Term to search for
     * @returns {Promise<boolean>}
     */
    async searchFileStack(searchTerm) {
        try {
            const searchInput = this.locators.fileStackSearchInput;
            if (await searchInput.count() === 0) {
                return false;
            }
            await searchInput.fill(searchTerm);
            await this.page.waitForTimeout(800);
            return true;
        } catch (error) {
            console.error('File stack search failed:', error.message);
            return false;
        }
    }

    /**
     * Clear search in file stack
     * @returns {Promise<boolean>}
     */
    async clearFileStackSearch() {
        try {
            const searchInput = this.locators.fileStackSearchInput;
            if (await searchInput.count() === 0) {
                return false;
            }
            await searchInput.fill('');
            await this.page.waitForTimeout(500);
            return true;
        } catch (error) {
            console.error('Clear search failed:', error.message);
            return false;
        }
    }

    // ========== FILE STACK SELECTION METHODS ==========

    /**
     * Select all files in stack
     * @returns {Promise<boolean>}
     */
    async selectAllFilesInStack() {
        try {
            const selectAllCheckbox = this.locators.fileStackSelectAllCheckbox;
            if (await selectAllCheckbox.count() === 0) {
                return false;
            }
            await selectAllCheckbox.check();
            await this.page.waitForTimeout(300);
            return true;
        } catch (error) {
            console.error('Select all failed:', error.message);
            return false;
        }
    }

    /**
     * Deselect all files in stack
     * @returns {Promise<boolean>}
     */
    async deselectAllFilesInStack() {
        try {
            const selectAllCheckbox = this.locators.fileStackSelectAllCheckbox;
            if (await selectAllCheckbox.count() === 0) {
                return false;
            }
            await selectAllCheckbox.uncheck();
            await this.page.waitForTimeout(300);
            return true;
        } catch (error) {
            console.error('Deselect all failed:', error.message);
            return false;
        }
    }

    /**
     * Select a specific file in stack
     * @param {number} index - Index of file to select
     * @returns {Promise<boolean>}
     */
    async selectFileInStack(index) {
        try {
            const checkboxes = this.locators.fileStackRowCheckboxes;
            if (await checkboxes.count() <= index) {
                return false;
            }
            await checkboxes.nth(index).check();
            await this.page.waitForTimeout(300);
            return true;
        } catch (error) {
            console.error('Select file in stack failed:', error.message);
            return false;
        }
    }

    // ========== FILE STACK ACTION METHODS ==========

    /**
     * Check if delete button is enabled
     * @returns {Promise<boolean>}
     */
    async isFileStackDeleteBtnEnabled() {
        const btn = this.locators.fileStackDeleteBtn;
        if (await btn.count() === 0) return false;
        return btn.isEnabled();
    }

    /**
     * Click delete button in file stack
     * @returns {Promise<boolean>}
     */
    async clickFileStackDeleteBtn() {
        try {
            const btn = this.locators.fileStackDeleteBtn;
            if (await btn.count() > 0 && await btn.isEnabled()) {
                await btn.click();
                await this.page.waitForTimeout(600);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Delete button click failed:', error.message);
            return false;
        }
    }

    /**
     * Click export button in file stack
     * @returns {Promise<boolean>}
     */
    async clickFileStackExportBtn() {
        try {
            const btn = this.locators.fileStackExportBtn;
            if (await btn.count() > 0) {
                await btn.click();
                await this.page.waitForTimeout(1000);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Export button click failed:', error.message);
            return false;
        }
    }

    /**
     * Click refresh button in file stack
     * @returns {Promise<boolean>}
     */
    async clickFileStackRefreshBtn() {
        try {
            const btn = this.locators.fileStackRefreshBtn;
            if (await btn.count() > 0) {
                await btn.click();
                await this.page.waitForTimeout(600);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Refresh button click failed:', error.message);
            return false;
        }
    }

    // ========== PAGINATION METHODS ==========

    /**
     * Get current page range text
     * @returns {Promise<string|null>}
     */
    async getFileStackPageRange() {
        const rangeLabel = this.locators.fileStackPageRange;
        if (await rangeLabel.count() > 0) {
            return (await rangeLabel.innerText()).trim();
        }
        return null;
    }

    /**
     * Go to next page in file stack
     * @returns {Promise<boolean>}
     */
    async goToNextFileStackPage() {
        try {
            const btn = this.locators.fileStackNextPageBtn;
            if (await btn.count() > 0 && await btn.isEnabled()) {
                await btn.click();
                await this.page.waitForTimeout(600);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Next page click failed:', error.message);
            return false;
        }
    }

    /**
     * Go to previous page in file stack
     * @returns {Promise<boolean>}
     */
    async goToPreviousFileStackPage() {
        try {
            const btn = this.locators.fileStackPrevPageBtn;
            if (await btn.count() > 0 && await btn.isEnabled()) {
                await btn.click();
                await this.page.waitForTimeout(600);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Previous page click failed:', error.message);
            return false;
        }
    }

    // ========== EMPTY STATE METHODS ==========

    /**
     * Check if file stack is in empty state
     * @returns {Promise<boolean>}
     */
    async isFileStackEmpty() {
        return this.locators.fileStackEmptyStateMessage.count() > 0;
    }

    /**
     * Get empty state message
     * @returns {Promise<string|null>}
     */
    async getFileStackEmptyStateMessage() {
        const msg = this.locators.fileStackEmptyStateMessage;
        if (await msg.count() > 0) {
            return (await msg.innerText()).trim();
        }
        return null;
    }
}

module.exports = FileUploadPageObject;
