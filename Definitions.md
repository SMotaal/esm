<!--prettier-ignore-start-->
# Definitions
<!--prettier-ignore-end-->

<dl>

## Module Formats

<dt>Standard Module

<dd>

Modules that can be loaded systematically through runtime evaluation of `module` code or an implementation derivative of it, without a bootstrapper, through static or dynamic `import` of idempotently located entrypoint(s) and potentially nested dependencies, and that conform to all relevant aspects of the ECMAScript language specification.

<dl>

<dt>Source Text Module
<dd>

Modules that are directly evaluated as `module` code at runtime — aka ECMAScript modules or ESM.

> **Note**: Source text modules used to wrap and/or expose other modules are still considered source text modules in that they are evaluated relative to their own idempotent location and not that of the wrapped module(s) they operate on.

<dt>Synthetic Module
<dd>

Modules that are indirectly derived through implementation-specific means, including but not limited to those resulting from the evaluation of code other than their own respective `module` code, exposing namespaces that conform to specifications defined for ECMAScript modules.

<dl>

<dt>Built-in or Platform
<dd>

Modules exposed intrinsically by the implementation, usually reserved for standard and/or proprietary APIs internally handled by the actual runtime.

> **Note**: Such modules, which are still highly experimental on critical platforms like browsers, and which are not meant to replace the globally exposed primordial specified by the ECMAScript specification and any historically relevant intrinsic runtime entities needed by legacy and/or isomorphic code.

<dt>Dynamic or Wrapper
<dd>

Modules exposed exterinsically by the implementation — like WebAssembly, JSON… etc.

> **Note**: Such modules, which are still highly experimental in general, always conform to all the same external conformance criteria (ie namespace and location aspects) applicable to ECMAScript modules.

</dl>

</dl>

<dt>Classic Module

<dd>

Modules that can be loaded directly through runtime evaluation of `classic` JavaScript code, using a bootstrapper which defines global and/or scoped interfaces to the module subsystem for the evaluated code to use.

> **Note**: Such modules, are not considered actual ECMAScript modules in the sense that they must be first be synthetically or statically wrapped independently to make them available for static or dynamic `import` and where only their conforming traits will be faithfully retained — ie exposing a single namespace with a predetermined set of valid identifier names.

<dl>

<dt>Require or CommonJS
<dd>

Modules that use the `require(…)` interface to synchronously import or export namespaced entities directly during the evaluation of their own body.

<dt>AMD
<dd>

Modules that use the `define(…)` interface to asynchronously import exported namespaces prior to the evaluation of their own body and the subsequent exporting of their own namespace.

<dt>UMD
<dd>

Modules that adapt to the presence of one or more module interfaces to import from and/or export to other modules of similar or different formats.

</dl>

<dt>Source-Transformed Module

<dd>

Modules that can only be loaded after they are transformed by specialized tooling, usually associated with a "build pipeline" and often rely on additional relatively located resources (tooling configuration... etc.) in order to generate the intended ECMAScript code for one or more target runtime(s).

<dl>

<dt>Down-Transpiled (ES-Like) Module
<dd>Modules based on ECMAScript syntax, usually relying on early-stage ECMAScript proposals or workflow-dependent conveniences — like the bundling of CSS and other non-ECMAScript resources.

<dt>Cross-Compiled (Non-ES) Module
<dd>

Modules not based on ECMAScript syntax, usually authored in source files that are **_not_** `text/javascript`.

</dl>

</dl>

---

<dl>

## Module Runtime

<dt>Module Loader
<dd>

Runtime subsystem(s) and processes that handle the various operations for importing modules from respective resources (of one or more formats) that determines how modules are resolved, located, retrieved, instantiated and imported by the runtime.

<dl>

<dt>Resolution
<dd>The operation used to determine the unique module identifier, which may also be the absolute resource location or some unique derivation of it, specified explicitly or implicitly by the importer or consumer.

> **Note**: This is ideally where realm-based module remapping would take place.

<dt>Location
<dd>The operation used to determine the unique resource location of a module based on its unique module identifier, by deterministic derivation, mapping and/or device-dependent operations, applicable to non-synthetic modules and synthetically wrapped resource modules which are retrieved from externally.

> **Note**: This is where context-based pre-caching would take place.

<dt>Retrieval
<dd>The operation used to transport content of non-synthetic and synthetically wrapped resource modules, usually handled on a per-context basis.

> **Note**: This is where context-based security/consistency checking would take place, and would likely include source text parsing and static pre-linking (ie for all relatively scoped resources).

<dt>Linking

<dd>The operation used to normalize and/or synthesize the single context or realm specific manifestation of a module, including the namespace object which hold the prefined set of yet-to-be-initialized exports.

> **Note**: This is ideally where augmentation (ie instrumentation) would take place.

<dt>Initialization

<dd>The operation used to initialized the exposed namespace, by synthetic binding or evaluation which could also be inclusive of side-effects.

> **Note**: At this point, it is essentially to assume that all preceding module loading operations across the entire module graph would have successfully completed and that all that all related module records have been sealed.

</dl>

<dt>Module Loader Architecture

<dd>

The abstract framework of constructs and routines relevant to the design and implementation of efficient, composable, and, safe module loaders.

<dl>

<dt>

Loader Extension (aka Custom/User Loader)

<dd>

Opt-in handlers for one or more module loading operations, usually instantiated during the boostrapping stage of the module loading controller for the container, to provide well-defined, chainable and deterministic alterations (ie improvements) from the default operation(s), involving:

- **`extension` _LogicalExtension_** (aka **_Resolver_**)

  A `container` attaches to single `scope` that encompasses one or more `module` record(s) mapped by their unique `moduleId`, and, recursively, zero or more `scope` record(s) mapped by their unique `scopeId`.

  > **Note**: An actual `resolver` will likely adopts actual `resolution hooks` with either `define` and/or `resolve` depending on the specific module loader architecture — for instance, one architecture being explored for safe modules considers custom handlers for `resolve` only, with `define` handlers being either omitted or restricted for internal use.

  - **`handler` _Scope:Definition_**
  - **`handler` _Module:Definition_**
  - **`handler` _Scope:Resolution_**
  - **`handler` _Module:Resolution_**

- **`extension` _ResourceExtension_** (aka **_Transporter_**)

  A `resource` contains its `body` that represents its `content` and for which there is a single `source` manifestation (ie source text where loaders are concerned).

  > **Note**: An actual `transporter` will likely adopt for _a subset of_ and/or _a more streamlined_ definition for the actual `transport hooks`.

  - **`handler` _Location_**
    1. **`handler` _Resource:Authorization_**
    2. **`handler` _Resource:Allocation_**
       - **`handler` _Resource:Searching_**
       - **`handler` _Resource:Validation_**
  - **`extension` _Retrieval_**
    1. **`handler` _Resource:Reading_**
    2. **`handler` _Source:Decryption_**
    3. **`handler` _Source:Compilation_**
       - **`handler` _Source:Analysis_**
       - **`handler` _Source:Transformation_**
  - **`extension` _Storage_**

    1. **`handler` _Source:Generation_**
       - **`handler` _Source:Mutation_**
       - **`handler` _Source:Collation_**
       - **`handler` _Source:Augmentation_**
       - **`handler` _Source:Annotation_**
    2. **`handler` _Source:Encryption_**
    3. **`handler` _Resource:Writing_**

       > **Note**: The body of the written resource or the lack of it determines the resource writing mode, ie `append`, `write` or `delete`.

- **`extension` _RuntimeExtension_** (aka **_Instrumenter_**)

  … TBD

<dt>Loader Scope

<dd>

Scope adds a layer of abstraction needed for separating module and actual resource concerns (locations, structures and/or formats), relating them symbolically through package encapsulations interdependencies.

> **Note**: Scopes provide a parallel abstraction for packages and/or origins (or service worker scopes) where it becomes possible to safely reason about requirements for remapping, instrumentation, and/or attenuation, while avoiding unintentional leakage of privileged resource-related details extranous to the effective fulfillment of these auxiliary loading behaviors.

Loader Scope is the abstraction used to define a partially-opaque mapping between a unique bare-specifier prefix string and the actual location it encapsulates and/or remaps in some capacity, involving:

- **`record` _ScopeRecord_**

  - **`unique` _ScopeId_**

  - **`string` _ScopedLocation_**

  - **`record` _ParentScope_**

  - **`records` _ScopedMappings_**

    - **`records` _ModuleMappings_**

      - **`unique` _ModuleId_**

    - **`records` _ScopeMappings_**

<!-- A normalized path-like module identifier denomination used to enforce artificial encapsulation for security/consistency considerations during the various module loading operations. -->

</dl>
</dl>
