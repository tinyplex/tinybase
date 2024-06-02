# Creating A Store

This guide shows you how to create a new Store.

Creating a Store requires just a simple call to the createStore function from
the store module.

```js
import {createStore} from 'tinybase';

const store = createStore();
```

Easy enough! The returned Store starts off empty of course:

```js
console.log(store.getValues());
// -> {}

console.log(store.getTables());
// -> {}
```

To fix that, let's move onto the Writing To Stores guide.
