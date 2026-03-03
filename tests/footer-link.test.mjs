#!/usr/bin/env node
/**
 * Test: Footer link URL and emojis
 *
 * Verifies that:
 *   - GITHUB_URL in config.js points to the correct URL with anchor fragment
 *   - ui.js uses DEFAULTS.GITHUB_URL for the footer GitHub link
 *   - ui.js uses UI_EMOJIS.footerReadme for the GitHub link emoji
 *   - ui.js uses UI_EMOJIS.footerLink for the Entur data link emoji
 *   - both emoji keys are defined in config.js UI_EMOJIS
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, '../src/config.js');
const uiPath     = join(__dirname, '../src/ui/ui.js');

const EXPECTED_URL = 'https://github.com/aheimsbakk/kollektiv-sanntid-org/#kollektivsanntidorg';

const configContent = readFileSync(configPath, 'utf-8');
const uiContent     = readFileSync(uiPath, 'utf-8');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
    failed++;
  }
}

test('GITHUB_URL in config.js contains correct URL with anchor', () => {
  if (!configContent.includes(EXPECTED_URL)) {
    throw new Error(`Expected GITHUB_URL '${EXPECTED_URL}' not found in config.js`);
  }
});

test('ui.js uses DEFAULTS.GITHUB_URL for the footer GitHub link', () => {
  if (!uiContent.includes('DEFAULTS.GITHUB_URL')) {
    throw new Error('ui.js does not reference DEFAULTS.GITHUB_URL for the footer link');
  }
});

test('config.js defines UI_EMOJIS.footerReadme', () => {
  if (!configContent.includes('footerReadme')) {
    throw new Error('UI_EMOJIS.footerReadme is not defined in config.js');
  }
});

test('config.js defines UI_EMOJIS.footerLink', () => {
  if (!configContent.includes('footerLink')) {
    throw new Error('UI_EMOJIS.footerLink is not defined in config.js');
  }
});

test('ui.js uses UI_EMOJIS.footerReadme for the GitHub link emoji', () => {
  if (!uiContent.includes('UI_EMOJIS.footerReadme')) {
    throw new Error('ui.js does not use UI_EMOJIS.footerReadme for the GitHub link emoji');
  }
});

test('ui.js uses UI_EMOJIS.footerLink for the Entur data link emoji', () => {
  if (!uiContent.includes('UI_EMOJIS.footerLink')) {
    throw new Error('ui.js does not use UI_EMOJIS.footerLink for the Entur data link emoji');
  }
});

console.log(`\nfooter-link: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
