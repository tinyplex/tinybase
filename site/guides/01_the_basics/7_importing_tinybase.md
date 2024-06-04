# Importing TinyBase

This guide provides a quick aside about importing TinyBase into your
application.

## Targets And Formats

The overall package includes a number of different versions of TinyBase,
transpiled for different targets and formats. You'll find them all in the
`./lib` folder of the package, and you can directly import them as follows:

| Directory   | Target | Format | Minified | Import                               |
| ----------- | ------ | ------ | -------- | ------------------------------------ |
| lib         | esnext | esm    | yes      | `import {...} from tinybase`         |
| lib/debug   | esnext | esm    | no       | `import {...} from tinybase/debug`   |
| lib/umd     | esnext | umd    | yes      | `import {...} from tinybase/umd`     |
| lib/cjs     | esnext | cjs    | yes      | `import {...} from tinybase/cjs`     |
| lib/es6     | es6    | esm    | yes      | `import {...} from tinybase/es6`     |
| lib/umd-es6 | es6    | umd    | yes      | `import {...} from tinybase/umd-es6` |
| lib/cjs-es6 | es6    | cjs    | yes      | `import {...} from tinybase/cjs-es6` |

## Indicating Schema-based Typing

As we will see in more details in the following TinyBase and TypeScript guide,
it is possible to use schema-aware type definitions by appending `with-schemas`
to the end of the path like this:

```ts yolo
import {createStore} from 'tinybase/with-schemas'; // NB the 'with-schemas'
```

## Using TinyBase Submodules

The tinybase module is the master package of all the functionality together
(except the ui-react module, tools module, and persister-\* modules which always
remain standalone options). Since many of the submodules share compiled-in
dependencies, the master package is smaller to include than including all of the
submodules separately.

However, for a very minimal set of submodules, you may save size by including
them piecemeal. If you only wanted a Store and a Metrics object, for example,
you could import them alone like this:

```js yolo
import {createStore} from 'tinybase/store';
import {createMetrics} from 'tinybase/metrics';
// ...
```

You can also import single packages in other targets and formats. For example:

```js yolo
import {createStore} from 'tinybase/es6/store';
import {createMetrics} from 'tinybase/es6/metrics';
import {useCell} from 'tinybase/es6/ui-react';
// ...
```

## React Native

If you are using [React Native](https://reactnative.dev/) - for example with
[Expo](https://expo.dev/) - be aware that the
[Metro](https://facebook.github.io/metro/) bundler does not currently support
module resolution very well. You may have to add in the `lib` portion of the
path to be explicit about your imports:

```js yolo
import {createStore} from 'tinybase/lib';
import {useCell} from 'tinybase/lib/ui-react';
```

## ESlint Resolver Issues

There is a [known
issue](https://github.com/import-js/eslint-plugin-import/issues/1810) with the
`no-unresolved` ESlint rule whereby it does not understand the `exports` section
of the TinyBase `package.json`. You may wish to disable that rule if you are
getting false positives using TinyBase submodules.

OK, enough with the `import` shenanigans. Let's briefly look at how TinyBase
benefits from using TypeScript to improve your developer experience in the
TinyBase and TypeScript guide.
