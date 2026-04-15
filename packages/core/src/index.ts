/**
 * Stampdown compatibility entry point
 * @deprecated Import from '@stampdwn/core', '@stampdwn/core/server', or '@stampdwn/core/client' instead.
 */

const deprecatedIndexImportWarningFlag = '__stampdwnCoreDeprecatedIndexImportWarning__';
const deprecatedIndexImportWarningState = globalThis as typeof globalThis & {
  __stampdwnCoreDeprecatedIndexImportWarning__?: boolean;
};

if (!deprecatedIndexImportWarningState[deprecatedIndexImportWarningFlag]) {
  deprecatedIndexImportWarningState[deprecatedIndexImportWarningFlag] = true;
  console.warn(
    "[stampdown] Importing from '@stampdwn/core/index' is deprecated. Use '@stampdwn/core', '@stampdwn/core/server', or '@stampdwn/core/client' instead."
  );
}

export * from './server';
