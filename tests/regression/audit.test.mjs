import test from 'node:test';
import assert from 'node:assert/strict';
import { runAudit } from './audit.mjs';

const report = runAudit();

test('all application source files are present and scanned', () => {
  assert.equal(report.files.html.path, 'Index.html');
  assert.equal(report.files.server.path, 'code.gs');
  assert.equal(report.files.locations.path, 'LocationData.gs');
  assert.ok(report.counts.inlineScriptBlocks > 0);
});

test('all inline JavaScript and Apps Script source parse successfully', () => {
  const errors = report.checks.syntax.filter(item => !item.ok);
  assert.deepEqual(errors, [], JSON.stringify(errors, null, 2));
});

test('Apps Script web entry point serves the actual Index.html page', () => {
  assert.equal(report.checks.doGetServesIndex, true);
});

test('every client call() endpoint exists in code.gs', () => {
  assert.deepEqual(report.failures.missingServerCalls, []);
});

test('server function declarations do not collide', () => {
  assert.deepEqual(report.failures.duplicateServerFunctionNames, []);
});

test('critical platform server endpoints remain present', () => {
  const actual = new Set(report.checks.serverCalls.map(item => item.name));
  for (const endpoint of [
    'login',
    'logout',
    'getBootstrap',
    'getModuleList',
    'getSheetData',
    'saveRecord',
    'updateRecord',
    'registerMadrasa',
    'saveMedia',
    'listMedia',
    'deleteMedia',
    'sendQuickService'
  ]) {
    assert.ok(actual.has(endpoint), `Expected client integration for ${endpoint}`);
  }
});
