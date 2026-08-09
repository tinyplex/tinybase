// NB: an exclamation mark after a line visually indicates an expected TS error
import {createStore as createStoreWithoutSchemas} from 'tinybase';
import {createMergeableStore} from 'tinybase/mergeable-store/with-schemas';
import {createStore} from 'tinybase/with-schemas';

// Store schema setters
(() => {
  createStore().setTablesSchema({
    pets: {
      answer: {type: ['string', 'boolean'], default: 1}, // !
    },
  });
  createStore().setValuesSchema({
    status: {enum: ['draft', 'live'], default: 'archived'}, // !
  });
  createStore().setSchema(
    {pets: {name: {type: 'string', default: null}}}, // !
  );
  createStore().setValuesSchema({
    name: {type: 'string', default: null, allowNull: true},
  });

  createStoreWithoutSchemas().setTablesSchema({
    pets: {
      status: {enum: ['draft', 'live'], default: 'archived'}, // !
    },
  });
  createStoreWithoutSchemas().setValuesSchema({
    answer: {type: ['string', 'boolean'], default: 1}, // !
  });
  createStoreWithoutSchemas().setSchema(
    {pets: {name: {type: 'string', default: null}}}, // !
  );
  createStoreWithoutSchemas().setValuesSchema({
    name: {type: 'string', default: null, allowNull: true},
  });
})();

// MergeableStore schema setters
(() => {
  const store = createMergeableStore();
  store.setTablesSchema({
    pets: {
      answer: {type: ['string', 'boolean'], default: 1}, // !
    },
  });
  store.setValuesSchema({
    status: {enum: ['draft', 'live'], default: 'archived'}, // !
  });
  store.setSchema({
    pets: {
      name: {type: 'string', default: null}, // !
    },
  });
})();

// Invalid defaults do not imply presence
(() => {
  const store = undefined as unknown as import('tinybase/with-schemas').Store<
    [
      {
        pets: {
          answer: {
            type: readonly ['string', 'boolean'];
            default: 1;
          };
        };
      },
      {
        status: {
          enum: readonly ['draft', 'live'];
          default: 'archived';
        };
      },
    ]
  >;
  store.getCell('pets', 'pet1', 'answer') satisfies
    string | boolean | undefined;
  store.getCell('pets', 'pet1', 'answer') satisfies string | boolean; // !
  store.getValue('status') satisfies 'draft' | 'live' | undefined;
  store.getValue('status') satisfies 'draft' | 'live'; // !
})();
