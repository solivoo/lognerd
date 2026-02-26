type FsModule = typeof import('fs');
type PathModule = typeof import('path');

const hasBrowserGlobals =
  typeof (globalThis as Record<string, unknown>).window !== 'undefined';

const isNode =
  !hasBrowserGlobals &&
  typeof process !== 'undefined' &&
  process.versions?.node !== undefined;

let _fs: FsModule | null = null;
let _path: PathModule | null = null;
let _loadPromise: Promise<void> | null = null;

export const isNodeEnvironment = (): boolean => isNode;

export const ensureNodeModules = async (): Promise<void> => {
  if (!isNode || (_fs && _path)) return;

  if (!_loadPromise) {
    _loadPromise = (async () => {
      try {
        _fs = await import('fs');
        _path = await import('path');
      } catch {
        _fs = null;
        _path = null;
      }
    })();
  }

  return _loadPromise;
};

export const getFs = (): FsModule | null => _fs;

export const getPath = (): PathModule | null => _path;
