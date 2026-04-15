/**
 * Tests for the core package entry points
 */

import * as client from '../client';
import * as server from '../server';

describe('Core package entry points', () => {
  afterEach(() => {
    delete (globalThis as { __stampdwnCoreDeprecatedIndexImportWarning__?: boolean })[
      '__stampdwnCoreDeprecatedIndexImportWarning__'
    ];
    jest.restoreAllMocks();
  });

  it('should expose browser-safe APIs from the client entry', () => {
    expect(client.Stampdown).toBeDefined();
    expect(client.Precompiler).toBeDefined();
    expect('TemplateLoader' in client).toBe(false);
  });

  it('should expose TemplateLoader from the server entry', () => {
    expect(server.TemplateLoader).toBeDefined();
  });

  it('should render templates from the client entry', () => {
    const stampdown = new client.Stampdown();

    expect(stampdown.render('Hello {{name}}!', { name: 'World' })).toBe('Hello World!');
  });

  it('should warn once for the deprecated index entry path', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    jest.isolateModules(() => {
      require('../index');
    });

    jest.isolateModules(() => {
      require('../index');
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      "[stampdown] Importing from '@stampdwn/core/index' is deprecated. Use '@stampdwn/core', '@stampdwn/core/server', or '@stampdwn/core/client' instead."
    );
  });
});
