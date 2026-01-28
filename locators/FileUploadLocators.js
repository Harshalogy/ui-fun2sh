// locators/FileUploadLocators.js
// NEW FILE - Dedicated File Upload Locators (DO NOT MODIFY EXISTING FILES)
// Created for comprehensive file upload testing

class FileUploadLocators {
    constructor(page) {
        this.page = page;

        // ========== UPLOAD STEP MODAL (NEW CASE WIZARD) ==========
        
        // Upload Step Container
        this.uploadStepContainer = page.locator('generic:has-text("Add any supporting documents")').first();
        this.uploadDescription = page.locator('text="Add any supporting documents for the case. This is optional for now."');
        
        // Add Files Button
        this.addFilesBtn = page.locator('button:has-text("Add files")').first();
        this.addFilesIcon = page.locator('button:has-text("Add files") img[src*="upload"]').first();
        this.addFilesLabel = page.locator('button:has-text("Add files") generic:has-text("Add files")').first();
        
        // File Input (hidden input element)
        this.fileInputField = page.locator('input[type="file"]').first();
        this.fileInputMultiple = page.locator('input[type="file"]');
        
        // Extract PDF Transactions Checkbox
        this.extractPdfCheckbox = page.locator('input[type="checkbox"]').first();
        this.extractPdfCheckboxContainer = page.locator('generic:has(> input[type="checkbox"]) + generic:has-text("Extract PDF Transactions")').first();
        this.extractPdfLabel = page.locator('text="Extract PDF Transactions"').first();
        this.extractPdfLabelClickable = page.locator('generic:has-text("Extract PDF Transactions")').first();
        
        // File Status Messages
        this.noFilesMessage = page.locator('text="No files selected yet."').first();
        this.fileSelectedMessage = page.locator('text=/\\d+ file(s)? selected/i').first();
        this.uploadingMessage = page.locator('text=/uploading|processing/i').first();
        this.uploadSuccessMessage = page.locator('text=/uploaded|success/i').first();
        this.uploadErrorMessage = page.locator('text=/error|failed|invalid/i').first();
        
        // File List Display
        this.fileListContainer = page.locator('generic:has(> button:has-text("Add files")) + generic').first();
        this.uploadedFilesList = page.locator('ul, ol, [role="list"]').first();
        this.uploadedFileItem = page.locator('[class*="file-item"], .uploaded-file, [role="listitem"]').first();
        this.uploadedFileItems = page.locator('[class*="file-item"], .uploaded-file, [role="listitem"]');
        
        // File Operations
        this.fileRemoveBtn = page.locator('button[aria-label*="delete"], button[aria-label*="remove"], [class*="file-item"] button[aria-label*="remove"]').first();
        this.fileRemoveBtns = page.locator('button[aria-label*="delete"], button[aria-label*="remove"], [class*="file-item"] button');
        
        // File Progress & Status
        this.fileProgress = page.locator('mat-progress-bar, progress, [role="progressbar"]').first();
        this.fileProgressList = page.locator('mat-progress-bar, progress, [role="progressbar"]');
        this.fileStatus = page.locator('[class*="status"], .file-status').first();
        
        // Wizard Navigation Buttons
        this.backBtn = page.getByRole('button', { name: /^back$/i }).first();
        this.nextBtn = page.getByRole('button', { name: /^next$/i }).first();
        this.cancelBtn = page.getByRole('button', { name: /^cancel$/i }).first();
        
        // Wizard Steps
        this.uploadWizardStep = page.locator('[class*="wizard"] [class*="step"]:has-text("Upload")').first();
        this.uploadWizardStepActive = page.locator('[class*="wizard"] [class*="step"][class*="active"]:has-text("Upload")').first();
        this.reviewWizardStep = page.locator('[class*="wizard"] [class*="step"]:has-text("Review")').first();
        
        // ========== FILE STACK / UPLOADED FILES TABLE (POST-UPLOAD) ==========
        
        // File Stack Table & Container
        this.fileStackContainer = page.locator('[class*="file-stack"], [class*="uploaded-files"], app-file-stack').first();
        this.fileStackTable = page.locator('table').first();
        this.fileStackTableHeaders = page.locator('th, [role="columnheader"]');
        this.fileStackTableRows = page.locator('tr, [role="row"]');
        
        // Table Columns
        this.fileNameColumnHeader = page.locator('th:has-text("File Name"), th:has-text("Filename"), [role="columnheader"]:has-text("File Name")').first();
        this.fileTypeColumnHeader = page.locator('th:has-text("Type"), th:has-text("File Type"), [role="columnheader"]:has-text("Type")').first();
        this.fileSizeColumnHeader = page.locator('th:has-text("Size"), [role="columnheader"]:has-text("Size")').first();
        this.uploadedAtColumnHeader = page.locator('th:has-text("Uploaded At"), th:has-text("Date"), [role="columnheader"]:has-text("Uploaded")').first();
        this.statusColumnHeader = page.locator('th:has-text("Status"), [role="columnheader"]:has-text("Status")').first();
        this.progressColumnHeader = page.locator('th:has-text("Progress"), [role="columnheader"]:has-text("Progress")').first();
        this.postProcessingColumnHeader = page.locator('th:has-text("Post Processing"), [role="columnheader"]:has-text("Post Processing")').first();
        
        // File Stack Search
        this.fileStackSearchInput = page.locator('input[placeholder*="search"], input[placeholder*="Search"], [role="searchbox"]').first();
        
        // File Stack Selection
        this.fileStackSelectAllCheckbox = page.locator('th input[type="checkbox"]').first();
        this.fileStackRowCheckboxes = page.locator('td input[type="checkbox"]');
        
        // File Stack Actions
        this.fileStackDeleteBtn = page.locator('button:has-text("Delete"), button[aria-label*="Delete"]').first();
        this.fileStackExportBtn = page.locator('button:has-text("Export"), button:has-text("CSV"), button[aria-label*="Export"]').first();
        this.fileStackRefreshBtn = page.locator('button[aria-label*="Refresh"], button:has-text("Refresh")').first();
        
        // File Stack Pagination
        this.fileStackPaginator = page.locator('mat-paginator').first();
        this.fileStackPageRange = page.locator('.mat-mdc-paginator-range-label').first();
        this.fileStackNextPageBtn = page.locator('button.mat-mdc-paginator-navigation-next').first();
        this.fileStackPrevPageBtn = page.locator('button.mat-mdc-paginator-navigation-previous').first();
        this.fileStackFirstPageBtn = page.locator('button.mat-mdc-paginator-navigation-first').first();
        this.fileStackLastPageBtn = page.locator('button.mat-mdc-paginator-navigation-last').first();
        
        // File Stack Empty State
        this.fileStackEmptyStateMessage = page.locator('text=/no files|empty|nothing|No records/i').first();
        
        // File Details in Stack
        this.fileNameCell = page.locator('td:nth-child(1)').first();
        this.fileTypeCell = page.locator('td:nth-child(2)').first();
        this.fileSizeCell = page.locator('td:nth-child(3)').first();
        this.uploadedAtCell = page.locator('td:nth-child(4)').first();
        this.statusCell = page.locator('td:nth-child(5)').first();
        this.progressCell = page.locator('td:nth-child(6)').first();
        this.postProcessingCell = page.locator('td:nth-child(7)').first();
        
        // ========== DRAG & DROP ZONE ==========
        
        this.dragDropZone = page.locator('[data-testid*="drop"], .drop-zone, [class*="drag"], [role="region"]:has-text(/drag|drop/)').first();
        this.dragDropOverlay = page.locator('[class*="drag-overlay"], [class*="drop-overlay"]').first();
        
        // ========== MODAL/DIALOG ELEMENTS ==========
        
        this.newCaseModal = page.locator('dialog, [role="dialog"], mat-dialog-container').first();
        this.newCaseModalTitle = page.locator('heading:has-text("New Case")').first();
        this.wizardContainer = page.locator('[class*="wizard"]').first();
    }
}

module.exports = FileUploadLocators;
