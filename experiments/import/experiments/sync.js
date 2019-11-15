// SEE: http://swannodette.github.io/2013/08/24/es6-generators-and-csp

class Syncer {
  static *counter() {
    for (let tick = 0; ++tick; yield /** @type {Syncer.Id} */ tick) yield;
  }

  /** @type {Syncer.Counter} */
  get counter() {
    if (!this.hasOwnProperty('counter'))
      return Object.defineProperty(this, 'counter', {value: Syncer.counter.call(this), writable: false}).counter;
  }

  /** @type {Syncer.Stack} */
  get stack() {
    if (!this.hasOwnProperty('stack')) return Object.defineProperty(this, 'stack', {value: {}, writable: false}).stack;
  }

  /** @type {Set<Promise>} */
  get promises() {
    if (!this.hasOwnProperty('promises'))
      return Object.defineProperty(this, 'promises', {value: new Set(), writable: false}).promises;
  }

  /**
   * @template T
   * @type {Map<Promise<T>, Syncer.Record<T>>}
   */
  get records() {
    if (!this.hasOwnProperty('records'))
      return Object.defineProperty(this, 'records', {value: new Map(), writable: false}).records;
  }

  sync(promise) {
    if (promise == null || typeof promise !== 'object' || !(promise instanceof Promise) || this.promises.has(promise))
      return;
    const record = {};
    record.id = this.counter.next();
    record.promise = promise;
    this.enqueue(record);
    record.syncer = (async () => {
      try {
        record.value = await promise;
      } catch (error) {
        record.error = error;
      } finally {
        this.counter.next();
      }
    })();
    this.counter.next();
    this.dequeue(record);
  }

  enqueue(record) {
    this.promises.add(record.promise);
    this.records.set(record.promise, record);
    this.stack[record.id] = record;
  }

  dequeue(record) {
    this.stack[record.id] = null;
    this.records.delete(record.promise, record);
    this.promises(record.promise);
  }
}

function syncer() {}

/** @typedef {number} Syncer.Id */
/** @template T @typedef {{id: Syncer.Id, promise: Promise<T>, value?: T, error?: any}} Syncer.Record */
/** @typedef {{[id: Syncer.Id]?: Syncer.Record & {id: id}}} Syncer.Stack */
/** @typedef {IterableIterator<Syncer.Id>} Syncer.Counter */
