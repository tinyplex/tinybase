# Importing TinyBase

This guide provides an aside about importing TinyBase into your application.

## The Simplest Imports

The simplest import of TinyBase is:

```js
import {createMetrics, createStore} from 'tinybase';
```

This will get you an ESNext, ESM, non-minified import of the main `tinybase`
module, (which contains most of the core functionality), and should be enough to
get started. You may also want to import specific persister, synchronizer, or UI
modules:

```js
import {createSessionPersister} from 'tinybase/persisters/persister-browser';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import {useCell} from 'tinybase/ui-react';
import {TableInHtmlTable} from 'tinybase/ui-react-dom';

// ... etc
```

All the example code throughout these guides and the API documentation are shown
with the correct imports so that you can be clear about which functions and
types come from which modules.

## Using TinyBase Submodules

The `tinybase` module is the master package of most of the core functionality.
It includes the following submodules:

- The store module
- The metrics module
- The indexes module
- The relationships module
- The queries module
- The checkpoints module
- The mergeable-store module
- The common module

Since many of the submodules above share compiled-in dependencies, the
master package is smaller to include than including all of the submodules
separately.

However, for a very minimal set of submodules, you may save size by including
them piecemeal. If you only wanted a Store and a Metrics object, for example,
you could import them alone like this:

```js yolo
import {createMetrics} from 'tinybase/metrics';
import {createStore} from 'tinybase/store';

// ...
```

With a good minifier in your application bundler, however, you may find that
this level of granularity is unnecessary, and that you can just stick with the
overall `tinybase` module for most things.

The submodules for various Persister and Synchronizer types are _not_ included
in the main tinybase module, but should be imported separately from inside the
`persisters` and `synchronizers` folders. See the Persistence and
Synchronization guides, respectively, for more details.

## Targets And Formats

Prior to TinyBase v6.0, the NPM package included a number of different versions of
each module, transpiled for different targets and formats. From v6.0 onwards,
only ESNext, ESM modules are included in the main package.

However, both non-minified and minified versions are available: the default is
non-minified code, but minified versions are available in the top-level `min`
folder:

```js yolo
import {createStore} from 'tinybase'; // non-minified
// or
import {createStore} from 'tinybase/min'; // minified
```

## Indicating Schema-based Typing

As we will see in more details in the following TinyBase And TypeScript guide,
it is possible to use schema-aware type definitions by appending `with-schemas`
to the very end of the path like this:

```js yolo
import {createStore} from 'tinybase/with-schemas';

// NB the 'with-schemas'
```

## Putting It All Together

As long as you put the optional parts of the path in the right order, you can
access all the valid combinations of minification, sub-module
and schema support. The syntax for the import (split onto different lines for
clarity) is:

```sh yolo
tinybase
  [ /min ]
    [ /store | /metrics | /queries | ... ]
      [ /with-schemas ]
```

For example, this is a non-exhaustive list of options that are all valid:

| Import                                                | Minified | Sub-module | With schemas |
| ----------------------------------------------------- | -------- | ---------- | ------------ |
| `import {...} from 'tinybase';`                       | no       |            | no           |
| `import {...} from 'tinybase/with-schemas';`          | no       |            | yes          |
| `import {...} from 'tinybase/min';`                   | yes      |            | no           |
| `import {...} from 'tinybase/store/with-schemas'`     | no       | store      | no           |
| `import {...} from 'tinybase/min/store/with-schemas'` | yes      | store      | yes          |
| ...                                                   |          |            |              |

If all else fails, take a look into the package folder and see what's what!

## React Native

If you are using [React Native](https://reactnative.dev/) - for example with
[Expo](https://expo.dev/) - be aware that the
[Metro](https://facebook.github.io/metro/) bundler does not currently support
module resolution very well. You may have to add in the exact file path to be
explicit about your imports:

```js yolo
import {createStore} from 'tinybase/index.js';
import {useCell} from 'tinybase/ui-react/index.js';
```

This situation is evolving however, so you may find these extra file names
unnecessary as bundler support improves.

Check out the [Expo TinyBase
example](https://github.com/expo/examples/tree/master/with-tinybase) for a
simple working template to get started with TinyBase and React Native.

## ESlint Resolver Issues

There is a [known
issue](https://github.com/import-js/eslint-plugin-import/issues/1810) with the
`no-unresolved` ESlint rule whereby it does not understand the `exports` section
of the TinyBase `package.json`. You may wish to disable that rule if you are
getting false positives using TinyBase submodules.

## Enough!

OK, we're done with the `import` shenanigans. Let's briefly look at how TinyBase
benefits from using TypeScript to improve your developer experience in the
TinyBase and TypeScript guide.
