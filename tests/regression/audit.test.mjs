import test from 'node:test';
import assert from 'node:assert/strict';
import { runAudit } from './audit.mjs';

const report = runAudit();

test('the deployed 8852ac4 source files are present and scanned', () => {
  assert.equal(report.files.html.path, 'Index.html');
  assert.equal(report.files.server.path, 'code.gs');
  assert.equal(report.files.locations.path, 'LocationData.gs');
  assert.ok(report.files.html.lines > 1000);
  assert.ok(report.counts.inlineScriptBlocks > 0);
});

test('all inline HTML scripts and Apps Script files have valid JavaScript syntax', () => {
  const errors = report.syntax.filter(item => !item.ok);
  assert.deepEqual(errors, [], JSON.stringify(errors, null, 2));
});

test('doGet serves the actual Index.html file', () => {
  assert.equal(report.doGetServesIndex, true);
});

test('every client call() endpoint exists in server-side source', () => {
  assert.deepEqual(report.missingClientEndpoints, []);
});

test('server function declarations have no duplicate names', () => {
  assert.deepEqual(report.duplicateServerFunctions, []);
});

test('every declared sheet has a matching header definition', () => {
  assert.deepEqual(report.sheetsWithoutHeaders, []);
  assert.ok(report.sheetKeys.length >= 20);
});

test('critical login, dashboard, student, media and quick-service endpoints remain present', () => {
  const expected = [
    'login', 'verifyLoginOtp', 'requestOtp', 'logout',
    'getBootstrap', 'getModuleList', 'getSheetData',
    'saveRecord', 'updateRecord', 'searchAll',
    'saveMedia', 'listMedia', 'deleteMedia',
    'getLocations', 'sendQuickService',
    'getAccountControlData', 'approveAccountDirect',
    'setAccountStatus', 'resetAccountPassword'
  ];
  for (const name of expected) {
    assert.ok(report.clientCalls.includes(name), 'Client endpoint is not wired: ' + name);
  }
});

test('side-effect integrations are inventoried for safe manual test planning', () => {
  assert.ok(Array.isArray(report.sideEffects));
  assert.ok(report.sideEffects.includes('SpreadsheetApp access'));
});
