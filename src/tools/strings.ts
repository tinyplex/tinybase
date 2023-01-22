import {EMPTY_STRING} from '../common/strings';
import {Id} from '../common.d';

export const THE_STORE = 'the Store';
export const A_FUNCTION_FOR = 'A function for';
export const EXPORT = 'export';
export const LISTENER = 'listener';
export const OR_UNDEFINED = ' | undefined';
export const REGISTERS_A_LISTENER = `Registers a ${LISTENER} that will be called`;
export const REPRESENTS = 'Represents';
export const RETURNS_VOID = ' => void';
export const THE_END_OF_THE_TRANSACTION = 'the end of the transaction';
export const THE_SPECIFIED_ROW = 'the specified Row';
export const A_STRING_SERIALIZATION_OF = 'a string serialization of';

const getTheContentOfDoc = (content: 0 | 1 | 2 = 0, theStore = 0): string =>
  `the ${CONTENT[content]}content of${theStore ? ` ${THE_STORE}` : ''}`;

export const getTheContentOfTheStoreDoc = (
  verb = 0,
  content: 0 | 1 | 2 = 0,
  set = 0,
) =>
  `${VERBS[verb]} ${getTheContentOfDoc(content, 1)}${set ? ' when set' : ''}`;

export const getRowTypeDoc = (tableId: Id, set = 0) =>
  `${REPRESENTS} a Row when ${
    set ? 's' : 'g'
  }etting ${getTheContentOfDoc()} the '${tableId}' Table`;

export const getIdsDoc = (idsNoun: string, parentNoun: string, sorted = 0) =>
  `Gets ${
    sorted ? 'sorted, paginated' : 'the'
  } Ids of the ${idsNoun}s in ${parentNoun}`;

export const getForEachDoc = (childNoun: string, parentNoun: string) =>
  `Calls a function for each ${childNoun} in ${parentNoun}`;

export const getHasDoc = (childNoun: string, parentNoun = THE_STORE) =>
  `Gets whether ${childNoun} exists in ${parentNoun}`;

export const getCallbackDoc = (takes: string) =>
  `A function that takes ${takes}`;

export const getListenerTypeDoc = (childNoun = 0, parentNoun = 0) =>
  `${A_FUNCTION_FOR} listening to changes to ` +
  `${NOUNS[childNoun]} in ${NOUNS[parentNoun]}`;

export const getListenerDoc = (
  childNoun: string,
  parentNoun: string,
  pluralChild = 0,
) =>
  `${REGISTERS_A_LISTENER} whenever ${childNoun} in ${parentNoun} change` +
  (pluralChild ? EMPTY_STRING : 's');

export const getTableDoc = (tableId: Id) => `the '${tableId}' Table`;

export const getRowDoc = (tableId: Id) =>
  `${THE_SPECIFIED_ROW} in ${getTableDoc(tableId)}`;

export const getCellDoc = (cellId: Id) => `the '${cellId}' Cell`;

export const getValueDoc = (valueId: Id) => `the '${valueId}' Value`;

export const getTableContentDoc = (tableId: Id, verb = 0) =>
  `${VERBS[verb]} ${getTheContentOfDoc()} ${getTableDoc(tableId)}`;

export const getRowContentDoc = (tableId: Id, verb = 0) =>
  `${VERBS[verb]} ${getTheContentOfDoc()} ${getRowDoc(tableId)}`;

export const getCellContentDoc = (tableId: Id, cellId: Id, verb = 0) =>
  `${VERBS[verb]} ${getCellDoc(cellId)} for ${getRowDoc(tableId)}`;

export const getValueContentDoc = (valueId: Id, verb = 0) =>
  `${VERBS[verb]} ${getValueDoc(valueId)}`;

export const VERBS = [
  'Gets',
  'Sets',
  'Sets part of',
  'Deletes',
  REPRESENTS,
  `Gets ${A_STRING_SERIALIZATION_OF}`,
  `Sets ${A_STRING_SERIALIZATION_OF}`,
  `${REGISTERS_A_LISTENER} whenever`,
];

const NOUNS = [
  THE_STORE,
  'Tables',
  'Table Ids',
  'a Table',
  'Row Ids',
  'a Row',
  'Cell Ids',
  'a Cell',
  'invalid Cell changes',
  'Values',
  'Value Ids',
  'a Value',
  'invalid Value changes',
];

const CONTENT = ['', 'tabular ', 'keyed value '];
