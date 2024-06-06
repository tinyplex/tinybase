import {
  ADD,
  CELL,
  EMPTY_STRING,
  GET,
  IDS,
  LISTENER,
  ROW,
  TABLE,
  TABLES,
  VALUE,
  VALUES,
} from '../../common/strings';
import type {Id} from '../../@types/common';

export const upper = (str: string) => str.toUpperCase();

export const lower = (str: string) => str.toLowerCase();

export const A = 'a ';
export const A_FUNCTION_FOR = 'A function for';
export const AND_REGISTERS =
  ', and registers a listener so that any changes to ' +
  'that result will cause a re-render';
export const CALLBACK = 'Callback';
export const CHANGES = 'Changes';
export const COUNT = 'Count';
export const DEL = 'Del';
export const DEPS = 'Deps';
export const DEPS_SUFFIX = DEPS + '?: React.DependencyList';
export const DO_ROLLBACK_PARAM = 'doRollback?: DoRollback';
export const DO_ACTIONS_AND_ROLLBACK_PARAMS =
  'actions: () => Return, ' + DO_ROLLBACK_PARAM;
export const EXPORT = 'export';
export const ID = 'Id';
export const INVALID = 'Invalid';
export const JSON = 'Json';
export const LISTENER_ = lower(LISTENER);
export const OPTIONAL_COLON = '?: ';
export const OR_UNDEFINED = ' | undefined';
export const NON_NULLABLE = 'NonNullable';
export const PARTIAL = 'Partial';
export const PROPS = 'Props';
export const PROVIDER = 'Provider';
export const REGISTERS_A_LISTENER = `Registers a ${LISTENER_} that will be called`;
export const REPRESENTS = 'Represents';
export const ROW_ID_PARAM = 'rowId: ' + ID;
export const SCHEMA = 'Schema';
export const SET = 'Set';
export const SORTED_ARGS =
  ', descending?: boolean, offset?: number, limit?: number';
export const SQUARE_BRACKETS = '[]';
export const THE_STORE = 'the Store';
export const TRANSACTION = 'Transaction';
export const TRANSACTION_ = lower(TRANSACTION);
export const TRANSACTION_DOC =
  'Execute a ' + TRANSACTION_ + ' to make multiple mutations';
export const START_TRANSACTION_DOC = 'Explicitly starts a ' + TRANSACTION_;
export const FINISH_TRANSACTION_DOC = 'Explicitly finishes a ' + TRANSACTION_;
export const THE_END_OF_THE_TRANSACTION = 'the end of the ' + TRANSACTION_;
export const VOID = 'void';
export const RETURNS_VOID = ' => ' + VOID;
export const WHEN_SET = 'WhenSet';
export const WHEN_SETTING_IT = ' when setting it';

const A_STRING_SERIALIZATION_OF = A + 'string serialization of';
const SPACE = ' ';
const GETS_A_CALLBACK_THAT_CAN = 'Gets a callback that can ';
const THE = 'the ';
const THE_SCHEMA_FOR = ' the schema for';

export const getHasDoc = (has = 0) => (has ? 'the existence of ' : '');

export const getTheContentOfDoc = (
  content: 0 | 1 | 2 = 0,
  theStore = 0,
  has = 0,
): string =>
  getHasDoc(has) +
  `the ${CONTENT[content]}content of` +
  (theStore ? SPACE + THE_STORE : EMPTY_STRING);

export const getTheContentOfTheStoreDoc = (
  content: 0 | 1 | 2 = 0,
  verb: number,
  set = 0,
  has = 0,
) =>
  VERBS[verb] +
  SPACE +
  getHasDoc(has) +
  getTheContentOfDoc(content, 1) +
  (set ? ' when setting it' : EMPTY_STRING);

export const getRowTypeDoc = (tableId: Id, set = 0) =>
  REPRESENTS +
  ` a Row when ${
    set ? 's' : 'g'
  }etting ${getTheContentOfDoc()} the '${tableId}' ` +
  TABLE;

export const getIdsDoc = (idsNoun: string, parentNoun: string, sorted = 0) =>
  `Gets ${sorted ? 'sorted, paginated' : 'the'} Ids of the ${idsNoun}s in ` +
  parentNoun;

export const getForEachDoc = (childNoun: string, parentNoun: string) =>
  `Calls a function for each ${childNoun} in ` + parentNoun;

export const getPropsDoc = (childNoun: string) =>
  'The props passed to a component that renders ' + childNoun;

export const getCallbackDoc = (takes: string) =>
  'A function that takes ' + takes;

export const getListenerTypeDoc = (
  childNoun: number,
  parentNoun = 0,
  has = 0,
) =>
  A_FUNCTION_FOR +
  ' listening to changes to ' +
  getHasDoc(has) +
  NOUNS[childNoun] +
  ' in ' +
  NOUNS[parentNoun];

export const getListenerDoc = (
  childNoun: number,
  parentNoun: number,
  pluralChild = 0,
  has = 0,
) =>
  REGISTERS_A_LISTENER +
  ' whenever ' +
  getHasDoc(has) +
  NOUNS[childNoun] +
  ' in ' +
  NOUNS[parentNoun] +
  ' change' +
  (pluralChild ? EMPTY_STRING : 's');

export const getTableDoc = (tableId: Id) => `the '${tableId}' ` + TABLE;

export const getRowDoc = (tableId: Id) =>
  'the specified Row in ' + getTableDoc(tableId);

export const getTableContentDoc = (tableId: Id, verb = 0, has = 0) =>
  VERBS[verb] +
  SPACE +
  getTheContentOfDoc(0, 0, has) +
  SPACE +
  getTableDoc(tableId);

export const getRowContentDoc = (tableId: Id, verb = 0, has = 0) =>
  VERBS[verb] + ` ${getTheContentOfDoc(0, 0, has)} ` + getRowDoc(tableId);

export const getCellContentDoc = (tableId: Id, cellId: Id, verb = 0, has = 0) =>
  VERBS[verb] +
  SPACE +
  getHasDoc(has) +
  `the '${cellId}' Cell for ` +
  getRowDoc(tableId);

export const getValueContentDoc = (valueId: Id, verb = 0, has = 0) =>
  VERBS[verb] + SPACE + getHasDoc(has) + `the '${valueId}' Value`;

export const VERBS = [
  'Gets',
  'Checks existence of',
  'Sets',
  'Deletes',
  'Sets part of',
  REPRESENTS,
  'Gets ' + A_STRING_SERIALIZATION_OF,
  'Sets ' + A_STRING_SERIALIZATION_OF,
  REGISTERS_A_LISTENER + ' whenever',
  GETS_A_CALLBACK_THAT_CAN + 'set',
  GETS_A_CALLBACK_THAT_CAN + 'add',
  GETS_A_CALLBACK_THAT_CAN + 'set part of',
  GETS_A_CALLBACK_THAT_CAN + 'delete',
  'Renders',
  'Gets ' + A_STRING_SERIALIZATION_OF + THE_SCHEMA_FOR,
  'Sets' + THE_SCHEMA_FOR,
  'Deletes' + THE_SCHEMA_FOR,
];

export const METHOD_PREFIX_VERBS = [
  GET,
  'has',
  'set',
  'del',
  'set', // partial
  'forEach',
  ADD,
  EMPTY_STRING,
];

const NOUNS = [
  THE_STORE,
  TABLES,
  THE + TABLE + SPACE + IDS,
  A + TABLE,
  THE + ROW + SPACE + IDS,
  A + ROW,
  THE + CELL + SPACE + IDS,
  A + CELL,
  'invalid Cell changes',
  VALUES,
  THE + VALUE + SPACE + IDS,
  A + VALUE,
  'invalid Value changes',
  THE + 'sorted ' + ROW + SPACE + IDS,
  THE + CELL + SPACE + IDS + ' anywhere',
  THE + 'number of Rows',
  A + CELL + ' anywhere',
];

const CONTENT = [EMPTY_STRING, 'tabular ', 'keyed value '];
