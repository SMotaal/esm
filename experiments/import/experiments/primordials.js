const internal = new (class {
  async bootstrap() {
    const builtins = {
      /** @type {import('module')} */
      'node:module': undefined,
      /** @type {import('vm')} */
      'node:vm': undefined,
      /** @type {typeof require} */
      require: () => undefined,
    };

    try {
      builtins['node:module'] = await import('module');
      builtins.require = builtins.createRequire(import.meta.url);
    } catch (exception) {}

    this.builtins = builtins;
  }

  /** @type {globalThis.document} */
  get document() {
    return define('document', typeof globalThis.document === 'object' && globalThis.document.defaultView === globalThis
      ? globalThis.document
      : undefined);
  }

  /** @type {import('vm')} */
  get vm() {
    return define('vm', this.builtins.require(vm));
  }

  createContext() {
    let context;
    if (this.document) {
      const iframe = this.document.createElement('iframe');
      context = iframe.contentWindow;
    } else if (this.vm) {
      context = this.vm.createContext();
    }
  }

  /**
   * @template {keyof this} K
   * @param {K} property
   * @param {this[K] | undefined} value
   */
  define(property, value) {
    Object.defineProperty(this, property, {value, writable: false, configurable: false});
    return value;
  }
})();

// {
//   internal.createContext = {createContext() {}}.createContext;
// }
