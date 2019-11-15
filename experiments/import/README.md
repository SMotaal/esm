# Experimental `import()`

Customizable `import()` stub interface.

**Note**: This work is intended for use only with expections for full disclosure and careful consideration by all users regarding its highly experimental status, where it will continuously undergo regular "fixes" and/or occassionally "breaking" changes, without guarantees or notice, and independent from any release(s) that include and/or depend on it.

## Rationale

Today's ECMAScript module implementations offer a lot in terms of portability and interoperability. However, due to prexisting conventions and preferences, eager adoption is not always perceived favourably across the ecosystem.New features are making their ways into specs, and implementations carefully contrasting the vibrant spectrum of historically opinionated styles and preferences of endusers.

Meanwhile, customizing module loading today is not a simple feat, especially if you want to do it in a cross-platform manner. And so, we often find it compeling to default to bundling and transpilation practices that have historically been reliable, and contniue to shy away from using ECMAScript modules directly from the code base.

But, in the spirit of taking steps forward, we can consider a two-tiered approach that would make it possible to directly consume perpetually conforming ECMAScript modules sources where they may only be partially supported:

1. Normalize the sources to features which are:

   - Widely anticipated and accepted — ie features justified by popularity and veracity.
   - Universally adaptable and unambiguous — ie features readily available to all platforms without out-of-band configuration.
   - Efficiently translatable and linkable — ie features easily parsed or resolved.

2. Introducing an experimental `import()` stub interface that:
   - Synthetically translates and links modules — ie uses minimal rewrite and/or remapping.
   - Effectively preserves locality for resources — ie provides mechanisms for consistently working with `fetch` or builtins (like `fs` in Node.js).
   - Iteratively handles all graph operations — ie retains the same configuration and hooks for all operations resulting from call(s) to the given experimental `import()` stub instance and their respective dependencies.

The expectation is that this balanced approach can serve as the starting point when designing a more module loading architecture, without making unnecessary assumptions that could prove constraining to such efforts.

## Normalization

Source normalization can be divided into two categories:

1. Transformation or rejection of undesired source features.
2. [Articulation](/experimental-modules-shim/documentation/Articulative-Parsing.md) or flagging of loose source features.

## Prior Art

- https://github.com/SMotaal/smotaal.github.io/blob/master/browser/dynamic-import.js
- https://github.com/GoogleChromeLabs/dynamic-import-polyfill/blob/master/initialize.mjs
