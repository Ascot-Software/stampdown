/**
 * Tests for the browser-conditioned package entry resolution.
 */

import { execFileSync } from 'child_process';
import { join } from 'path';

const PACKAGE_ROOT = join(__dirname, '..', '..');
const NPM_COMMAND = process.platform === 'win32' ? 'npm.cmd' : 'npm';

interface BrowserEntryResult {
  hasTemplateLoader: boolean;
  rendered: string;
  resolved: string;
}

/**
 * Build the core package so the browser-conditioned package export resolves against current output.
 */
function buildCorePackage(): void {
  execFileSync(NPM_COMMAND, ['run', 'build'], {
    cwd: PACKAGE_ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
  });
}

/**
 * Import the package root with the browser export condition enabled.
 * @returns The resolved entry path and a small runtime smoke-test payload.
 */
function runBrowserEntrySmokeTest(): BrowserEntryResult {
  const output = execFileSync(
    process.execPath,
    [
      '--conditions=browser',
      '--input-type=module',
      '-e',
      `const resolved = await import.meta.resolve('@stampdwn/core');
const core = await import('@stampdwn/core');
console.log(JSON.stringify({
  hasTemplateLoader: 'TemplateLoader' in core,
  rendered: new core.Stampdown().render('Hello {{name}}!', { name: 'Browser' }),
  resolved,
}));`,
    ],
    {
      cwd: PACKAGE_ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
    }
  );

  return JSON.parse(output.trim()) as BrowserEntryResult;
}

describe('Browser package entry', () => {
  beforeAll(() => {
    buildCorePackage();
  }, 30000);

  it('should resolve the root package import to the client entry', () => {
    const result = runBrowserEntrySmokeTest();

    expect(result.resolved).toContain('/dist/client.js');
    expect(result.resolved).not.toContain('/dist/server.js');
  });

  it('should load the browser-safe runtime surface from the root package import', () => {
    const result = runBrowserEntrySmokeTest();

    expect(result.hasTemplateLoader).toBe(false);
    expect(result.rendered).toBe('Hello Browser!');
  });
});
