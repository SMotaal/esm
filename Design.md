# Design

## Requirements

The following requirements are already captured by this document:

- [x] Module resolution from bare "module ids".
- [x] Module location and retrieval from "scope ids".
- [x] Multiple "initialized" module instances per "instantiated" module.

The following requirements are not yet captured by this document:

- [ ] Remapping for `scopeId` (ie Container or Loader based).
- [ ] Remapping for `moduleId` (ie Container or Loader based).

## Architecture

### Ephemeral Record

An ephemeral record is a symbolic data model that deterministically and interdependently reflects a respective stateful runtime instance, to the extent that it can affect the concurrent distribution of runtime functions across _environment_ boundaries.

```ts
/** The semi-opaque mapping string following a known convention */
type EphemeralHash<K extends string = string> = string & {
  includes(substring: '#'): true;
  split(delimiter: '#', limit?: number): [K, string];
  toLowerCase(): this;
};

type EphemeralRecords<K extends string = string> = {
  [k in K]: EphemeralRecord<k>;
};

interface EphemeralRecord<K extends string = string> {
  '(kind)': K;
  '(hash)': EphemeralHash<K>;
}
```

#### Instantiation

New instances of classes with respective ephemeral record automatically create an ephemeral record in their same host _environment_ when constructed, where such records are considered to be _instantiated_ (ie local) records.

Those relationships are defined as follows:

```ts
type Parenthesize<K extends string = string> = string & {
  indexOf(substring: K): 1;
  lastIndexOf(substring: K): 1;
  includes(substring: K): true;
  startsWith('('): true;
  endsWith(')'): true;
  slice(1, -1): K;
}

interface EphemeralInstance<R extends EphemeralRecord> {
  [Parenthesize<R['(kind)']>]: R;
}

interface InstantiatedEphemeralRecord<K extends string = string> extends EphemeralRecord<K> {
  '(instance)': EphemeralInstance<this>;
}
```

#### Serialization and Distribution

The abstract term _environment_ specifically refers to an host-encapsulated operating runtime, without any concrete stipulation of the encapsulating mechanisms, like _threads_, _processes_, _systems_... etc.

With this separation, it is possible to reason about serialization and construction with a simple `kind-to-type` mapping for each environment (ie using the `(kind)` field to lookup the record constructor during parsing).

```ts
type EphemeralTypes<K extends string = string> = {
  [k in K]: new <R extends EphemeralRecord<k>>(data?: Partial<R>) => R;
};
```

> **Note**: Distributed records are not instantiable in that they do not have a one-to-one relationship to the instantiated class they reflect, where instead they may be considered to symbolically have a one-to-many relationships with classes having some shared underlying interface.

Unlike instance, records must always prioritize serialization by avoiding special objects like URLs.

For instance, records for URLs can be defined as follows:

```ts
type PatternString<P extends RegExp, V extends string = string> = V & {
  match(pattern: P): RegExpMatchArray & {0: V};
  replace<R>(pattern: P, string: R): R;
};

declare const URLPattern: RegExp;
type URLString<V extends string = string> = PatternString<URLPattern, V>;
```

The same concept can be extended as follows:

```ts
declare const ScopeIdPattern: RegExp;
type ScopeIdString<V extends string = string> = PatternString<
  ScopeIdPattern,
  V
>;

declare const ModuleIdPattern: RegExp;
type ModuleIdString<V extends string = string> = PatternString<
  ModuleIdPattern,
  V
>;
```

### Container

A container is a runtime abstraction for working with contexts and realms across locally and/or remotely hosted runtime environments.

#### Container Records

```ts
type ContainerHash = EphemeralHash<'container'>;

interface ContainerRecords extends EphemeralRecords<'container'> {}

interface ContainerRecord extends EphemeralRecord<'container'> {
  '(kind)': 'container';
  '(hash)': ContainerHash;

  type: 'context' | 'realm';
  base: URLString;
  host?: URL;

  root: ContainerHash;
  parent: ContainerHash | null;
  loader: LoaderHash;
}

interface InstantiatedContainerRecord
  extends ContainerRecord,
    InstantiatedEphemeralRecord<'container'> {
  '(instance)': Container<this>;
}

interface RootContainerRecord extends InstantiatedContainerRecord {
  host: null;
  root: this['(hash)'];
  parent: null;
}

interface NestedContainerRecord extends InstantiatedContainerRecord {
  host: null;
  root: this['parent']['root'];
  parent: ContainerHash;
}

interface RemoteContainerRecord extends ContainerRecord {
  host: URL;
}
```

#### Container Instances

```ts
abstract class Container<R extends ContainerRecord = ContainerRecord>
  implements EphemeralInstance<R> {
  '(container)': R;

  type: R['type'];
  base: R['base'];

  root: ContainerRecords[R['root']];
  parent?: ContainerRecords[R['parent']] | undefined;
  loader?: Loader | undefined;
}

class RootContainer<
  R extends InstantiatedContainerRecord = InstantiatedContainerRecord
> extends Container<R> {
  root: this;
  parent?: undefined;
  loader?: RootLoader;
  scope?: this['loader']['scope'];
}

class NestedContainer<R extends InstantiatedContainerRecord> extends Container<
  R
> {
  root: RootContainer;
  parent?: RootContainer | NestedContainer;
  loader?: NestedLoader;
  scope?: this['loader']['scope'];
}

class RemoteContainer<
  R extends RemoteContainerRecord = RemoteContainerRecord
> extends Container<R> {
  '(container)': RemoteContainerRecord;
  loader?: undefined;
}
```

### Loader

A loader is a runtime abstraction for loading modules and resources within each container.

#### Loader Records

```ts
type LoaderHash = EphemeralHash<'loader'>;

interface LoaderRecords extends EphemeralRecords<'loader'> {}

interface LoaderRecord extends EphemeralRecord<'loader'> {
  '(kind)': 'loader';
  '(hash)': LoaderHash;

  root: LoaderHash;
  parent: LoaderHash | null;
  container: ContainerHash;
  scope: ScopeHash;
}

interface InstantiatedLoaderRecord
  extends LoaderRecord,
    InstantiatedEphemeralRecord<'loader'> {
  '(instance)': Loader<this>;
}

interface RootLoaderRecord extends InstantiatedLoaderRecord {
  root: this['(hash)'];
  parent: null;
}

interface NestedLoaderRecord extends InstantiatedLoaderRecord {
  root: this['parent']['root'];
  parent: LoaderHash;
}

interface RemoteLoaderRecord extends LoaderRecord {}
```

#### Loader Instances

```ts
abstract class Loader<R extends LoaderRecord = LoaderRecord>
  implements EphemeralInstance<R> {
  '(loader)': R;
  root: LoaderRecords[R['root']];
  parent?: LoaderRecords[R['parent']] | undefined;
  container: ContainerRecords[R['container']];
  scope: ScopeRecords[R['scope']];
}

class RootLoader<
  R extends InstantiatedLoaderRecord = InstantiatedLoaderRecord
> extends Loader<R> {
  root: this;
  parent?: undefined;
  container: RootContainerRecord;
}

class NestedLoader<R extends InstantiatedLoaderRecord> extends Loader<R> {
  root: RootLoader;
  parent?: RootLoader | NestedLoader;
  container: NestedContainerRecord;
}

class RemoteLoader<R extends LoaderRecord = LoaderRecord> extends Loader<R> {
  container: RemoteContainerRecord;
}
```

### Scope

A scope is a runtime abstraction for locating (and relating) resources based on scoped `moduleId` mappings — ie bare specifiers that start with a given `ScopeIdString` part(s).

#### Scope Records

```ts
type ScopeHash = EphemeralHash<'scope'>;

interface ScopeRecords extends EphemeralRecords<'scope'> {}

interface ScopeRecord extends EphemeralRecord<'scope'> {
  '(kind)': 'scope';
  '(hash)': ScopeHash;

  id: ScopeIdString;
  mode: 'package' | 'virtual';
  location: URLString;
  scopes: ScopeHash[];
  modules: {[name: ModuleIdString]: ModuleHash};
}

interface InstantiatedScopeRecord
  extends ScopeRecord,
    InstantiatedEphemeralRecord<'scope'> {
  '(instance)': Scope<this>;
}
```

#### Scope Instances

```ts
class Scope<R extends ScopeRecord = ScopeRecord>
  implements EphemeralInstance<R> {
  '(scope)': R;

  id: ScopeIdString;
  mode: R['mode'];
  location: R['location'];
  scopes?: Map<ScopeHash, Scope>;
  modules?: Map<ModuleIdString, Module>;
}
```

### Module

A module is a runtime abstraction for retrieving and initializing instances of modules based on their `moduleId`.

#### Module Records

```ts
type ModuleHash = EphemeralHash<'module'>;

interface ModuleRecords extends EphemeralRecords<'module'> {}

interface ModuleRecord extends EphemeralRecord<'module'> {
  '(kind)': 'module';
  '(hash)': ModuleHash;

  id: ModuleIdString;
  scope: ScopeHash;
  type: 'source-text' | 'synthetic';
}

interface InstantiatedModuleRecord
  extends ModuleRecord,
    InstantiatedEphemeralRecord<'module'> {
  '(instance)': Module<this>;
}
```

#### Module Instances

```ts
class Module<R extends ModuleRecord = ModuleRecord>
  implements EphemeralInstance<R> {
  '(module)': R;

  id: ModuleIdString;
  type: R['type'];
  scope: ScopeRecords[R['scope']];
}

class InitializedModule<
  R extends InstantiatedModuleRecord = InstantiatedModuleRecord
> extends Module<R> {
  container: RootContainer | NestedContainer;
  scope: this['container']['scope']['scopes'][R['scope']];
}
```
