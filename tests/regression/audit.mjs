import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const FILES = {
  html: path.join(ROOT, 'Index.html'),
  server: path.join(ROOT, 'code.gs'),
  locations: path.join(ROOT, 'LocationData.gs')
};

function readRequired(file) {
  if (!fs.existsSync(file)) throw new Error('Missing source file: ' + path.relative(ROOT, file));
  return fs.readFileSync(file, 'utf8');
}
function declarations(source) {
  return [...source.matchAll(/(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]);
}
function duplicates(values) {
  const seen = new Set(), repeated = new Set();
  for (const value of values) { if (seen.has(value)) repeated.add(value); seen.add(value); }
  return [...repeated].sort();
}
function unique(values) { return [...new Set(values)]; }
function objectKeys(source, name) {
  const start = source.indexOf('const ' + name + ' = {');
  if (start < 0) return [];
  const end = source.indexOf('\n};', start);
  if (end < 0) return [];
  return [...source.slice(start, end).matchAll(/(?:^|[,\s])([A-Z][A-Z0-9_]*)\s*:/gm)].map(m => m[1]);
}

export function runAudit() {
  const html = readRequired(FILES.html);
  const server = readRequired(FILES.server);
  const locations = readRequired(FILES.locations);
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
    .map((m, i) => ({ index: i + 1, attributes: m[1].trim(), source: m[2] }));
  const serverFunctions = declarations(server);
  const locationFunctions = declarations(locations);
  const allServerFunctions = new Set([...serverFunctions, ...locationFunctions]);
  const clientCalls = unique([...html.matchAll(/\bcall\s*\(\s*(['"])([A-Za-z_$][\w$]*)\1/g)].map(m => m[2])).sort();
  const syntax = [];
  for (const script of scripts) {
    try { new vm.Script(script.source, { filename: 'Index.html:inline-script-' + script.index + '.js' }); syntax.push({ file: 'Index.html', block: script.index, ok: true }); }
    catch (e) { syntax.push({ file: 'Index.html', block: script.index, ok: false, error: e.message }); }
  }
  for (const [file, source] of [['code.gs', server], ['LocationData.gs', locations]]) {
    try { new vm.Script(source, { filename: file }); syntax.push({ file, ok: true }); }
    catch (e) { syntax.push({ file, ok: false, error: e.message }); }
  }
  const sheetKeys = objectKeys(server, 'SHEETS');
  const headerKeys = objectKeys(server, 'HEADERS');
  const sideEffects = [];
  if (/\bMailApp\.sendEmail\s*\(/.test(server)) sideEffects.push('MailApp.sendEmail');
  if (/\bGmailApp\./.test(server)) sideEffects.push('GmailApp');
  if (/\bUrlFetchApp\.fetch\s*\(/.test(server + '\n' + locations)) sideEffects.push('UrlFetchApp.fetch');
  if (/\bSpreadsheetApp\.(?:getActiveSpreadsheet|openById)\s*\(/.test(server)) sideEffects.push('SpreadsheetApp access');
  const doGetServesIndex = /function\s+doGet\s*\([\s\S]*?createHtmlOutputFromFile\s*\(\s*['"]Index['"]/.test(server);
  return {
    files: {
      html: { path: 'Index.html', lines: html.split(/\r?\n/).length },
      server: { path: 'code.gs', lines: server.split(/\r?\n/).length },
      locations: { path: 'LocationData.gs', lines: locations.split(/\r?\n/).length }
    },
    counts: { inlineScriptBlocks: scripts.length, serverFunctions: serverFunctions.length, locationFunctions: locationFunctions.length, clientCalls: clientCalls.length },
    syntax,
    doGetServesIndex,
    clientCalls,
    missingClientEndpoints: clientCalls.filter(name => !allServerFunctions.has(name)),
    duplicateServerFunctions: duplicates(serverFunctions),
    sheetKeys,
    headerKeys,
    sheetsWithoutHeaders: sheetKeys.filter(key => !headerKeys.includes(key)),
    sideEffects
  };
}
