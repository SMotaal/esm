import {existsSync, readFileSync} from 'fs';
import {builtinModules} from 'module';
import {cwd, argv, argv0, execArgv} from 'process';
import {STANDARD_FORMAT as ESM, COMMONJS_FORMAT as CJS, BUILTIN_FORMAT as BUILTIN} from './constants.mjs';

const ROOT = `file://`;
const SCOPE = `${new URL('../../', import.meta.url)}`;
const SCOPES = ['/common/loader/', '/node/loader/'].map(s => `${SCOPE}${s.slice(1)}`);

let main;
const mainArgv = argv[1];
const Scoped = url =>
  (url && (url = `${url}`).startsWith(SCOPE) && SCOPES.find(s => url.startsWith(s)) && url) || undefined;

const tracing = /\?(?:.*&)?\btrace\b/.test(import.meta.url);

const resolver = new (class LegacyNodeResolver {
  async resolve(specifier, referrer, resolve) {
    let resolved, url, format, trace;
    try {
      const {initialized = (this.initialized = this.initialize())} = this;
      if (referrer && Scoped(referrer)) {
        trace = 'scoped';
        ({url, format} = resolved = await resolve(specifier, referrer));
        Scoped(url) && format === CJS && (resolved.format = ESM);
        return resolved;
      }
      if (initialized && initialized.then) {
        trace = 'deferred';
        return (resolved = await (await initialized)(specifier, referrer, resolve));
      }
      return this.resolver(specifier, referrer, resolve);
    } finally {
      tracing && trace && console.log(trace, {specifier, referrer, resolve, url, format});
    }
  }

  async initialize() {
    const {NodeResolver} = await import('./resolver.js');
    const resolver = (this.resolver = class extends NodeResolver {
      isBuiltin(specifier) {
        return builtinModules.includes(specifier);
      }

      async find(url) {
        return (url && existsSync(new URL(url, `${ROOT}/`))) || false;
      }

      async read(url) {
        try {
          return `${(url && readFileSync(new URL(url, `${ROOT}/`))) || ''}`;
        } catch (exception) {
          // returns undefined to defer throwing to implementations
        }
      }

      async resolve(specifier, referrer = this.base, resolve) {
        let resolved, url, format, isMain, trace;
        try {
          main || specifier !== mainArgv || (specifier = main = specifier.replace(/^\//, `${ROOT}/`));
          isMain = specifier === main;

          ({url, format} = resolved = await this.resolveSpecifier(specifier, referrer, isMain));
          (!isMain &&
            ((format === BUILTIN || format === CJS) && ({url, format} = resolved = resolve(specifier, referrer)))) ||
            (resolved.url = `${url}`);
          isMain && (resolved.main = true);
          trace = (resolved && (format || 'unknown')) || 'unresolved';
          return resolved;
        } finally {
          tracing && trace && console.log(trace, {specifier, referrer, resolve, url, format, isMain});
        }
      }

      async resolveIndex(location, extensions = this.extensions) {
        let url;
        if (extensions && location)
          for (const extension of extensions)
            if (await this.find((url = new URL(`index${extension}`, location)))) return `${url}`;
      }
    }.createResolver(`${ROOT}/${cwd()}`, {
      extensions: ['.js', '.json', '.node', '.mjs'],
    }));

    this.initialized = true;
    return resolver;
  }
})();

export const resolve = (...args) => resolver.resolve(...args);
