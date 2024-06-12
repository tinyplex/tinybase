# Importing TinyBase

This guide provides a quick aside about importing TinyBase into your
application.

## The Simplest Imports

The simplest import of TinyBase is:

```js
import {createStore, createMetrics} from 'tinybase';
```

This will get you an ESNext, ESM, minified import of the main `tinybase` module,
(which contains most of the core functionality), and should be enough to get
started. You may also want to import specific persister, synchronizer, or UI
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
- The default is minified code, but un-minified debug versions are available in
  `debug` folders.

These options are added to the path (after `tinybase`) when you import. So for
example, the default ESNext, minified ESM import of the main `tinybase` module
would be:

```js yolo
import {createStore} from 'tinybase';
```

Conversely, the ES6, _un_-minified ESM import of the main `tinybase` module would
be:

```js yolo
import {createStore} from 'tinybase/es6/debug';
```

...and of course `tinybase/es6` and `tinybase/debug` specify minified ES6, and
un-minified ESNext, respectively.

As seen above, the default format is ESM, but CJS versions are available in
`cjs` sub-folders. These are automatically used when you use `require` in a CJS
environment, rather than `import` in ESM:

```js yolo
const {createStore} = require('tinybase'); // will load tinybase/cjs/index.cjs
```

You can combine target paths with this too. This will load the ES6, un-minified
CJS module, for example:

```js yolo
const {createStore} = require('tinybase/es6/debug');
```

...and so on.

## Indicating Schema-based Typing

As we will see in more details in the following TinyBase and TypeScript guide,
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
[ /debug ]
[ /store | /metrics | /queries | ... ]
[ /with-schemas ]
```

For example, this is a non-exhaustive list of options that are all valid:

| Import                                                   | Format | Target | Minified | Sub-module | With schemas |
| -------------------------------------------------------- | ------ | ------ | -------- | ---------- | ------------ |
| `import {...} from 'tinybase';`                          | esm    | esnext | yes      |            | no           |
| `import {...} from 'tinybase/with-schemas';`             | esm    | esnext | yes      |            | yes          |
| `import {...} from 'tinybase/debug';`                    | esm    | esnext | no       |            | no           |
| `import {...} from 'tinybase/es6';`                      | esm    | es6    | yes      |            | no           |
| `import {...} from 'tinybase/es6/store'`                 | esm    | es6    | yes      | store      | no           |
| `import {...} from 'tinybase/es6/metrics/with-schemas';` | esm    | es6    | yes      | metrics    | yes          |
| `const {...} = require('tinybase');`                     | cjs    | esnext | yes      |            | no           |
| `const {...} = require('tinybase/debug/ui-react');`      | cjs    | esnext | no       | ui-react   | no           |
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
`require`d:

```html
<script src="https://unpkg.com/tinybase/dist/umd/index.js"></script>
```

And again, there are ES6 and debug versions of those too:

```html
<script src="https://unpkg.com/tinybase/dist/umd/es6/debug/index.js"></script>
```

You can then access the members of these modules using global constants that
start with the name `TinyBase`. For example:

```js yolo
const {createStore} = TinyBase;
const {Provider, useCell, useCreateStore} = TinyBaseUiReact;
const {TableInHtmlTable} = TinyBaseUiReactDom;
const {Inspector} = TinyBaseUiReactInspector;
```

## Enough!

OK, we're done with the `import` shenanigans. Let's briefly look at how TinyBase
benefits from using TypeScript to improve your developer experience in the
TinyBase and TypeScript guide.
