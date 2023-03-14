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
import {Id} from '../../common.d';

export const upper = (str: string) => str.toUpperCase();

export const lower = (str: string) => str.toLowerCase();

export const A = 'a ';
export const A_FUNCTION_FOR = 'A function for';
export const CALLBACK = 'Callback';
export const DEL = 'Del';
export const EXPORT = 'export';
export const ID = 'Id';
export const INVALID = 'Invalid';
export const JSON = 'Json';
export const LISTENER_ = lower(LISTENER);
export const OR_UNDEFINED = ' | undefined';
export const NON_NULLABLE = 'NonNullable';
export const PARTIAL = 'Partial';
export const REGISTERS_A_LISTENER = `Registers a ${LISTENER_} that will be called`;
export const REPRESENTS = 'Represents';
export const ROW_ID_PARAM = 'rowId: Id';
export const SCHEMA = 'Schema';
export const SET = 'Set';
export const SORTED_ARGS =
  ', descending?: boolean, offset?: number, limit?: number';
export const SQUARE_BRACKETS = '[]';
export const STORE = 'Store';
export const THE_STORE = 'the ' + STORE;
export const THE_SCHEMA_FOR = ' the schema for';
export const TRANSACTION = 'Transaction';
export const TRANSACTION_ = lower(TRANSACTION);
export const THE_END_OF_THE_TRANSACTION = 'the end of the ' + TRANSACTION_;
export const VOID = 'void';
export const RETURNS_VOID = ' => ' + VOID;
export const WHEN_SET = 'WhenSet';
export const WHEN_SETTING_IT = ' when setting it';

const A_STRING_SERIALIZATION_OF = A + 'string serialization of';
const SPACE = ' ';
const GETS_A_CALLBACK_THAT_CAN = 'Gets a callback that can ';
const THE = 'the ';

export const getTheContentOfDoc = (
  content: 0 | 1 | 2 = 0,
  theStore = 0,
): string =>
  `the ${CONTENT[content]}content of` +
  (theStore ? SPACE + THE_STORE : EMPTY_STRING);

export const getTheContentOfTheStoreDoc = (
  content: 0 | 1 | 2 = 0,
  verb: number,
  set = 0,
) =>
  VERBS[verb] +
  SPACE +
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

export const getListenerTypeDoc = (childNoun: number, parentNoun = 0) =>
  A_FUNCTION_FOR +
  ' listening to changes to ' +
  NOUNS[childNoun] +
  ' in ' +
  NOUNS[parentNoun];

export const getListenerDoc = (
  childNoun: number,
  parentNoun: number,
  pluralChild = 0,
) =>
  REGISTERS_A_LISTENER +
  ' whenever ' +
  NOUNS[childNoun] +
  ' in ' +
  NOUNS[parentNoun] +
  ' change' +
  (pluralChild ? EMPTY_STRING : 's');

export const getTableDoc = (tableId: Id) => `the '${tableId}' ` + TABLE;

export const getRowDoc = (tableId: Id) =>
  'the specified Row in ' + getTableDoc(tableId);

export const getContentDoc = (verb = 0, noun = 0) =>
  VERBS[verb] + SPACE + NOUNS[noun];

export const getTableContentDoc = (tableId: Id, verb = 0) =>
  VERBS[verb] + ` ${getTheContentOfDoc()} ` + getTableDoc(tableId);

export const getRowContentDoc = (tableId: Id, verb = 0) =>
  VERBS[verb] + ` ${getTheContentOfDoc()} ` + getRowDoc(tableId);

export const getCellContentDoc = (tableId: Id, cellId: Id, verb = 0) =>
  VERBS[verb] + ` the '${cellId}' Cell for ` + getRowDoc(tableId);

export const getValueContentDoc = (valueId: Id, verb = 0) =>
  VERBS[verb] + ` the '${valueId}' Value`;

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
];

const CONTENT = [EMPTY_STRING, 'tabular ', 'keyed value '];
