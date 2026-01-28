// locators/TC11EditCase.locators.js

const { BASE_URL } = require("./CommonAttributesLocators");

/**
 * TC11 is for Edit Case flow:
 * Dashboard -> Case Details -> Edit Case
 *
 * DOM references from your shared HTML:
 * - Dashboard case list controls: .io-case-list-controls, .io-search-input, .io-columns-select, .io-export-btn, .io-table
 * - Case row link: a.io-case-link
 * - Case details Edit button: button:has-text("Edit Case")
 * - Edit page container uses .case-edit__* classes
 */
const TC11 = {
  routes: {
    dashboard: `${BASE_URL}/`,
  },

  dashboard: {
    breadcrumbActive: 'app-breadcrumb .breadcrumb__item--active',
    pageTitle: '.io-title:has-text("Cases")',
    caseListSectionTitle: '.io-case-list-title:has-text("Case List")',
    columnsSelect: "select.io-columns-select",
    searchInput: "input.io-search-input",
    clearBtn: 'button.io-export-btn:has-text("Clear")',
    exportBtn: 'button.io-export-btn:has-text("Export CSV")',
    table: "table.io-table",
    tbodyRows: "table.io-table tbody tr",
    firstCaseLink: "table.io-table tbody tr a.io-case-link",
  },

  caseDetails: {
    breadcrumbActive: 'app-breadcrumb .breadcrumb__item--active',
    editCaseBtn: 'button:has-text("Edit Case")',
    uploadedFileStackBtn: 'button:has-text("Uploaded File Stack")',
    // The big header pill contains ack in a nested span (example: » ack7346)
    headerAckSpan: 'span:has-text("»")',
  },

  editCase: {
    // page container
    header: ".case-edit__header",
    breadcrumb: ".case-edit__breadcrumb",
    title: ".case-edit__header-main h1",
    form: ".case-edit__form",

    // fields - use formcontrolname for Angular forms
    // description textarea with formcontrolname attribute for better specificity
    description: "textarea[formcontrolname='description']",

    // footer buttons
    backBtn: 'button:has-text("Back")',
    cancelBtn: 'button:has-text("Cancel")',
    saveBtn: 'button:has-text("Save")',

    // optional UI bits
    charCounter: '.case-edit__form [class*="counter"], .case-edit__form [class*="char"], [class*="counter"], [class*="char"]',

    // file stack block exists on edit page per CSS: app-file-stack
    fileStack: "app-file-stack",
    fileUploadInput: 'input[type="file"]',
  },
};

module.exports = { TC11 };
