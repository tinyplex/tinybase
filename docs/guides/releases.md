<p>This is a reverse chronological list of the major <a href="https://tinybase.org/">TinyBase</a> releases, with highlighted features.</p><h2 id="v1-3-0">v1.3.0</h2><p>Adds support for explicit transaction start and finish methods, as well as listeners for transactions finishing.</p><p>The <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/starttransaction"><code>startTransaction</code></a> method and <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/finishtransaction"><code>finishTransaction</code></a> method allow you to explicitly enclose a transaction that will make multiple mutations to the <a href="https://tinybase.org/api/store/interfaces/store/store"><code>Store</code></a>, buffering all calls to the relevant listeners until it completes when you call the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/finishtransaction"><code>finishTransaction</code></a> method.</p><p>Unlike the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/transaction"><code>transaction</code></a> method, this approach is useful when you have a more &#x27;open-ended&#x27; transaction, such as one containing mutations triggered from other events that are asynchronous or not occurring inline to your code. You must remember to also call the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/finishtransaction"><code>finishTransaction</code></a> method explicitly when the transaction is started with the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/starttransaction"><code>startTransaction</code></a> method, of course.</p>

```js
const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
store.addRowListener('pets', 'fido', () => console.log('Fido changed'));

store.startTransaction();
store.setCell('pets', 'fido', 'color', 'brown');
store.setCell('pets', 'fido', 'sold', true);
store.finishTransaction();
// -> 'Fido changed'
```

<p>In addition, see the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addwillfinishtransactionlistener"><code>addWillFinishTransactionListener</code></a> method and the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/adddidfinishtransactionlistener"><code>addDidFinishTransactionListener</code></a> method for details around listening to transactions completing.</p>

```js
store.addWillFinishTransactionListener((store, cellsTouched) =>
  console.log(`Cells touched: ${cellsTouched}`),
);

store.transaction(() => store.setCell('pets', 'fido', 'species', 'dog'));
// -> 'Cells touched: false'

store.transaction(() => store.setCell('pets', 'fido', 'color', 'walnut'));
// -> 'Cells touched: true'
// -> 'Fido changed'
```

<p>Together, this release allows stores to couple their transaction life-cycles together, which we need for the query engine.</p><h2 id="v1-2-0">v1.2.0</h2><p>This adds a way to revert transactions if they have not met certain conditions.</p><p>When using the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/transaction"><code>transaction</code></a> method, you can provide an optional <code>doRollback</code> callback which should return true if you want to revert the whole transaction at its conclusion.</p><p>The callback is provided with two objects, <code>changedCells</code> and <code>invalidCells</code>, which list all the net changes and invalid attempts at changes that were made during the transaction. You will most likely use the contents of those objects to decide whether the transaction should be rolled back.</p><h2 id="v1-1-0">v1.1.0</h2><p>This release allows you to listen to invalid data being added to a <a href="https://tinybase.org/api/store/interfaces/store/store"><code>Store</code></a>, allowing you to gracefully handle errors, rather than them failing silently.</p><p>There is a new listener type <a href="https://tinybase.org/api/store/type-aliases/listener/invalidcelllistener"><code>InvalidCellListener</code></a> and a <a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addinvalidcelllistener"><code>addInvalidCellListener</code></a> method in the <a href="https://tinybase.org/api/store/interfaces/store/store"><code>Store</code></a> interface.</p><p>These allow you to keep track of failed attempts to update the <a href="https://tinybase.org/api/store/interfaces/store/store"><code>Store</code></a> with invalid <a href="https://tinybase.org/api/store/type-aliases/store/cell"><code>Cell</code></a> data. These listeners can also be mutators, allowing you to address any failed writes programmatically.</p><p>For more information, please see the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addinvalidcelllistener"><code>addInvalidCellListener</code></a> method documentation. In particular, this explains how this listener behaves for a <a href="https://tinybase.org/api/store/interfaces/store/store"><code>Store</code></a> with a <a href="https://tinybase.org/api/store/type-aliases/schema/schema"><code>Schema</code></a>.</p>