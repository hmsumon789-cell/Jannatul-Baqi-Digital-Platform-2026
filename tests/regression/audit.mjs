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
  if (!fs.existsSync(file)) {
    throw new Error('Required project file is missing: ' + path.relative(ROOT, file));
  }
  return fs.readFileSync(file, 'utf8');
}

function declarations(source) {
  return [...source.matchAll(/(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)]
    .map(match => match[1]);
}

function unique(values) {
  return [...new Set(values)];
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated].sort();
}

function extractScripts(html) {
  const scripts = [];
  const pattern = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  for (const match of html.matchAll(pattern)) {
    scripts.push({
      index: scripts.length,
      attributes: match[1].trim(),
      source: match[2]
    });
  }
  return scripts;
}

function extractIds(html) {
  return [...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match => match[1]);
}

function extractServerCalls(html) {
  const calls = [];
  const pattern = /\bcall\s*\(\s*(['"])([A-Za-z_$][\w$]*)\1/g;
  for (const match of html.matchAll(pattern)) calls.push(match[2]);
  return unique(calls).sort();
}

function extractEventHandlers(html) {
  const handlers = [];
  const pattern = /\bon([a-z]+)\s*=\s*("([^"]*)"|'([^']*)')/gi;
  for (const match of html.matchAll(pattern)) {
    const expression = match[3] ?? match[4] ?? '';
    const names = [...expression.matchAll(/(?:^|[;{}\s])([A-Za-z_$][\w$]*)\s*\(/g)]
      .map(item => item[1])
      .filter(name => ![
        'if', 'for', 'while', 'switch', 'return', 'confirm', 'alert',
        'prompt', 'setTimeout', 'clearTimeout', 'setInterval',
        'clearInterval', 'parseInt', 'Number', 'String'
      ].includes(name));
    handlers.push({ event: match[1].toLowerCase(), expression, names: unique(names) });
  }
  return handlers;
}

function declaredOrExposedNames(scripts) {
  const names = new Set();
  for (const script of scripts) {
    for (const name of declarations(script.source)) names.add(name);
    for (const match of script.source.matchAll(/window\.([A-Za-z_$][\w$]*)\s*=/g)) {
      names.add(match[1]);
    }
  }
  return names;
}

export function runAudit() {
  const html = readRequired(FILES.html);
  const server = readRequired(FILES.server);
  const locations = readRequired(FILES.locations);
  const scripts = extractScripts(html);
  const htmlFunctions = scripts.flatMap(script => declarations(script.source));
  const serverFunctions = declarations(server);
  const serverFunctionSet = new Set(serverFunctions);
  const serverCalls = extractServerCalls(html);
  const ids = extractIds(html);
  const handlers = extractEventHandlers(html);
  const exposed = declaredOrExposedNames(scripts);

  const syntax = [];
  for (const script of scripts) {
    try {
      new vm.Script(script.source, { filename: 'Index.html:inline-script-' + (script.index + 1) + '.js' });
      syntax.push({ file: 'Index.html', block: script.index + 1, ok: true });
    } catch (error) {
      syntax.push({ file: 'Index.html', block: script.index + 1, ok: false, error: error.stack || error.message });
    }
  }

  for (const [file, source] of [['code.gs', server], ['LocationData.gs', locations]]) {
    try {
      new vm.Script(source, { filename: file });
      syntax.push({ file, ok: true });
    } catch (error) {
      syntax.push({ file, ok: false, error: error.message });
    }
  }

  const missingServerCalls = serverCalls.filter(name => !serverFunctionSet.has(name));
  const missingEventHandlers = unique(
    handlers.flatMap(handler => handler.names).filter(name => !exposed.has(name))
  ).sort();
  const perScriptDuplicateFunctions = scripts.flatMap(script =>
    duplicates(declarations(script.source)).map(name => ({ name, scriptBlock: script.index + 1 }))
  );

  const doGetServesIndex = /function\s+doGet\s*\([\s\S]*?createHtmlOutputFromFile\s*\(\s*['"]Index['"]/.test(server);
  return {
    generatedAt: new Date().toISOString(),
    mode: 'read-only-static-audit',
    files: {
      html: { path: 'Index.html', lines: html.split(/\r?\n/).length, bytes: Buffer.byteLength(html) },
      server: { path: 'code.gs', lines: server.split(/\r?\n/).length, bytes: Buffer.byteLength(server) },
      locations: { path: 'LocationData.gs', lines: locations.split(/\r?\n/).length, bytes: Buffer.byteLength(locations) }
    },
    counts: {
      inlineScriptBlocks: scripts.length,
      htmlFunctionDeclarations: htmlFunctions.length,
      uniqueHtmlFunctionNames: unique(htmlFunctions).length,
      serverFunctionDeclarations: serverFunctions.length,
      uniqueServerFunctionNames: unique(serverFunctions).length,
      serverCalls: serverCalls.length,
      inlineEventHandlers: handlers.length,
      htmlIds: ids.length
    },
    checks: {
      syntax,
      doGetServesIndex,
      serverCalls: serverCalls.map(name => ({ name, exists: serverFunctionSet.has(name) }))
    },
    warnings: {
      duplicateHtmlFunctionNamesAcrossScriptBlocks: duplicates(htmlFunctions),
      duplicateIds: duplicates(ids),
      duplicateFunctionDeclarationsWithinOneScript: perScriptDuplicateFunctions,
      unresolvedInlineHandlerNames: missingEventHandlers
    },
    failures: {
      syntaxErrors: syntax.filter(item => !item.ok),
      missingServerCalls,
      duplicateServerFunctionNames: duplicates(serverFunctions),
      doGetDoesNotServeIndex: !doGetServesIndex
    }
  };
}

function printReport(report) {
  console.log('JANNATUL BAQI — READ-ONLY REGRESSION AUDIT');
  console.log('==========================================');
  console.log('Files: Index.html (' + report.files.html.lines + ' lines), code.gs (' + report.files.server.lines + ' lines), LocationData.gs (' + report.files.locations.lines + ' lines)');
  console.log('Inline scripts: ' + report.counts.inlineScriptBlocks);
  console.log('Client function declarations: ' + report.counts.htmlFunctionDeclarations + ' (' + report.counts.uniqueHtmlFunctionNames + ' unique names)');
  console.log('Server function declarations: ' + report.counts.serverFunctionDeclarations);
  console.log('Client-to-server endpoints: ' + report.counts.serverCalls);
  console.log('Inline event handlers: ' + report.counts.inlineEventHandlers);
  console.log('');
  console.log('Syntax checks: ' + report.checks.syntax.filter(item => item.ok).length + '/' + report.checks.syntax.length + ' passed');
  console.log('Missing server endpoints: ' + report.failures.missingServerCalls.length);
  console.log('Duplicate IDs (warning): ' + report.warnings.duplicateIds.length);
  console.log('Unresolved inline handler names (warning): ' + report.warnings.unresolvedInlineHandlerNames.length);
  if (report.failures.syntaxErrors.length) console.error('SYNTAX ERRORS:', JSON.stringify(report.failures.syntaxErrors, null, 2));
  if (report.failures.missingServerCalls.length) console.error('MISSING SERVER ENDPOINTS:', report.failures.missingServerCalls.join(', '));
  if (report.warnings.duplicateIds.length) console.warn('DUPLICATE IDS:', report.warnings.duplicateIds.join(', '));
  if (report.warnings.unresolvedInlineHandlerNames.length) console.warn('UNRESOLVED HANDLER NAMES:', report.warnings.unresolvedInlineHandlerNames.join(', '));
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const report = runAudit();
  printReport(report);
  if (
    report.failures.syntaxErrors.length ||
    report.failures.missingServerCalls.length ||
    report.failures.duplicateServerFunctionNames.length ||
    report.failures.doGetDoesNotServeIndex
  ) process.exitCode = 1;
}
