// global-setup.js
// This file is a placeholder - sessionStorage injection is handled in beforeEach hooks
// Playwright doesn't restore sessionStorage automatically, so we inject it in tests

async function globalSetup() {
  // No setup needed here - sessionStorage injection happens in test beforeEach hooks
}

module.exports = globalSetup;
