# Importing TinyBase

This guide provides an aside about importing TinyBase into your application.

## The Simplest Imports

The simplest import of TinyBase is:

```js
import {createStore, createMetrics} from 'tinybase';
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
- The persisters module
- The synchronizers module
- The common module

Since many of the submodules above share compiled-in dependencies, the
master package is smaller to include than including all of the submodules
separately.

However, for a very minimal set of submodules, you may save size by including
them piecemeal. If you only wanted a Store and a Metrics object, for example,
you could import them alone like this:

```js yolo
import {createStore} from 'tinybase/store';
import {createMetrics} from 'tinybase/metrics';
// ...
```

With a good minifier in your application bundler, however, you may find that
this level of granularity is unnecessary, and that you can just stick with the
overall `tinybase` module for most things.

## Targets And Formats

The complete TinyBase NPM package includes a number of different versions of
each module, transpiled for different targets and formats. You'll find them all
directly under the top-level of the package:

- The default target is ESNext, but ES6 versions are available in `es6`
  sub-folders.
- The default is non-minified code, but minified versions are available in the
  `min` folders.

These options are added to the path (after `tinybase`) when you import. So for
example, the default ESNext, non-minified ESM import of the main `tinybase` module
would be:

```js yolo
import {createStore} from 'tinybase';
```

Conversely, the ES6, _minified_ ESM import of the main `tinybase` module would
be:

```js yolo
import {createStore} from 'tinybase/es6/min';
```

...and of course `tinybase/es6` and `tinybase/min` specify non-minified ES6, and
minified ESNext, respectively.

As seen above, the default format is ESM, but CJS versions are available in
`cjs` sub-folders. These are automatically used when you use `require` in a CJS
environment, rather than `import` in ESM:

```js yolo
const {createStore} = require('tinybase'); // will load tinybase/cjs/index.cjs
```

You can combine target paths with this too. This will load the ES6, minified
CJS module, for example:

```js yolo
const {createStore} = require('tinybase/es6/min');
```

...and so on.

## Indicating Schema-based Typing

As we will see in more details in the following TinyBase And TypeScript guide,
it is possible to use schema-aware type definitions by appending `with-schemas`
to the very end of the path like this:

```js yolo
import {createStore} from 'tinybase/with-schemas'; // NB the 'with-schemas'
```

## Putting It All Together

As long as you put the optional parts of the path in the right order, you can
access all the valid combinations of target, format, minification, sub-module
and schema support. The syntax for the import (split onto different lines for
clarity) is:

```sh yolo
tinybase
  [ /es6 ]
    [ /min ]
      [ /store | /metrics | /queries | ... ]
        [ /with-schemas ]
```

For example, this is a non-exhaustive list of options that are all valid:

| Import                                                   | Format | Target | Minified | Sub-module | With schemas |
| -------------------------------------------------------- | ------ | ------ | -------- | ---------- | ------------ |
| `import {...} from 'tinybase';`                          | esm    | esnext | no       |            | no           |
| `import {...} from 'tinybase/with-schemas';`             | esm    | esnext | no       |            | yes          |
| `import {...} from 'tinybase/min';`                      | esm    | esnext | yes      |            | no           |
| `import {...} from 'tinybase/es6';`                      | esm    | es6    | no       |            | no           |
| `import {...} from 'tinybase/es6/store'`                 | esm    | es6    | no       | store      | no           |
| `import {...} from 'tinybase/es6/metrics/with-schemas';` | esm    | es6    | no       | metrics    | yes          |
| `const {...} = require('tinybase');`                     | cjs    | esnext | no       |            | no           |
| `const {...} = require('tinybase/min/ui-react');`        | cjs    | esnext | yes      | ui-react   | no           |
| ...                                                      |        |        |          |            |              |

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

## ESlint Resolver Issues

There is a [known
issue](https://github.com/import-js/eslint-plugin-import/issues/1810) with the
`no-unresolved` ESlint rule whereby it does not understand the `exports` section
of the TinyBase `package.json`. You may wish to disable that rule if you are
getting false positives using TinyBase submodules.

## UMD Modules

Finally, UMD versions are available in `umd` sub-folders. The `umd` files are
designed to be linked to in classic-style web pages, rather than `import`ed or
`require`d.

It will be typical to use the minified versions of these in production:

```html
<script src="https://unpkg.com/tinybase/dist/umd/min/index.js"></script>
```

But again, there are ES6 and non-minified versions of those too, such as:

```html
<script src="https://unpkg.com/tinybase/dist/umd/es6/index.js"></script>
```

When using UMD, you can access the members of these modules using global
constants that start with the name `TinyBase`. For example:

```js yolo
const {createStore} = TinyBase;
const {Provider, useCell, useCreateStore} = TinyBaseUiReact;
const {TableInHtmlTable} = TinyBaseUiReactDom;
const {Inspector} = TinyBaseUiReactInspector;
```

If all else fails, take a look into the package folder and see what's what!

## Enough!

OK, we're done with the `import` shenanigans. Let's briefly look at how TinyBase
benefits from using TypeScript to improve your developer experience in the
TinyBase and TypeScript guide.
