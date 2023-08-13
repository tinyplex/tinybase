# Command Line

TinyBase v2.2 includes a command line tool to assist with common actions in a
non-programmatic tool chain.

While this tool may add more functionality in the future, for now it is
essentially limited to code generation, creating APIs from a file-based
schema.

You can run the `tinybase` CLI using node's `npx` command:

```bash
npx tinybase
```

This will emit a list of the commands that are available:

```bash
tinybase <command>

Usage:

 tinybase help
 - print this message

 tinybase version
 - get the current TinyBase version

 tinybase getStoreApi <schemaFile> <storeName> <outputDir>
 - generate .d.ts, .ts, and .tsx files from a schema file
```

Currently there are three commands. `help` generates this message and `version`
prints out the version of the installed tinybase module.

More interestingly, `getStoreApi` takes schemas (a TablesSchema and
ValuesSchema, JSON-encoded in an array pair) from a file and emits `.d.ts`,
`.ts`, and `.tsx` files for it (much as described in the Generating APIs guide).

For example, imagine if you have defined TinyBase TablesSchema and ValuesSchema
objects in a file called `schema.json`:

```json
[
  {
    "pets": {
      "species": {"type": "string", "default": "dog"},
      "price": {"type": "number"}
    }
  },
  {
    "open": {"type": "boolean", "default": false}
  }
]
```

The `getStoreApi` command takes a reference to that file, a name for the wrapped
store (and file names), and an output directory (which must already exist):

```bash
npx tinybase getStoreApi schema.json shop api
```

This will list out the two files that have been generated:

```bash
             Definition: [...]/api/shop.d.ts
         Implementation: [...]/api/shop.ts
    UI React definition: [...]/api/shop-ui-react.d.ts
UI React implementation: [...]/api/shop-ui-react.tsx
```

These will contain the definition of the API:

```ts yolo
//...
/**
 * Represents the 'pets' Table.
 */
export type PetsTable = {[rowId: Id]: PetsRow};

/**
 * Represents a Row when getting the content of the 'pets' Table.
 */
export type PetsRow = {species: string; price?: number};
//...
```

And the implementation:

```ts yolo
//...
export const createShop: typeof createShopDecl = () => {
  // ...
  const store = createStore().setTablesSchema({
    pets: {
      species: {type: 'string', default: 'dog'},
      price: {type: 'number'},
    },
  });
  return {
    hasPetsTable: (): boolean => store.hasTable('pets'),
    getPetsTable: (): PetsTable => store.getTable('pets') as PetsTable,
    // ...
  };
};
```

...and so on.

These four files, of course, can now be used to build and implement your own
app.

We conclude this section on developer tools with a look at how you can inspect
the content of your data. Please continue to the Inspecting Data guide.
