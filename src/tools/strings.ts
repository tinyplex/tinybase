import {Id} from '../common.d';

const THE_CONTENT_OF = 'the content of';

export const THE_STORE = 'the Store';
export const A_FUNCTION_FOR = 'A function for';
export const EXPORT = 'export';
export const LISTENER = 'listener';
export const OR_UNDEFINED = ' | undefined';
export const REGISTERS_A_LISTENER = `Registers a ${LISTENER} that will be called`;
export const REPRESENTS = 'Represents';
export const RETURNS_VOID = ' => void';
export const THE_CONTENT_OF_THE_STORE = `${THE_CONTENT_OF} ${THE_STORE}`;
export const THE_END_OF_THE_TRANSACTION = 'the end of the transaction';
export const THE_SPECIFIED_ROW = 'the specified Row';

export const getRowTypeDoc = (tableId: Id, set = 0) =>
  `${REPRESENTS} a Row when ${
    set ? 's' : 'g'
  }etting ${THE_CONTENT_OF} the '${tableId}' Table`;

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
  `${nouns[childNoun]} in ${nouns[parentNoun]}`;

export const getListenerDoc = (
  childNoun: string,
  parentNoun: string,
  pluralChild = 0,
) =>
  `${REGISTERS_A_LISTENER} whenever ${childNoun} in ${parentNoun} change` +
  (pluralChild ? '' : 's');

export const getStoreContentDoc = (verb = 0) =>
  `${verbs[verb]} ${THE_CONTENT_OF_THE_STORE}`;

export const getTableDoc = (tableId: Id) => `the '${tableId}' Table`;

export const getRowDoc = (tableId: Id) =>
  `${THE_SPECIFIED_ROW} in ${getTableDoc(tableId)}`;

export const getCellDoc = (cellId: Id) => `the '${cellId}' Cell`;

export const getTableContentDoc = (tableId: Id, verb = 0) =>
  `${verbs[verb]} ${THE_CONTENT_OF} ${getTableDoc(tableId)}`;

export const getRowContentDoc = (tableId: Id, verb = 0) =>
  `${verbs[verb]} ${THE_CONTENT_OF} ${getRowDoc(tableId)}`;

export const getCellContentDoc = (tableId: Id, cellId: Id, verb = 0) =>
  `${verbs[verb]} ${getCellDoc(cellId)} for ${getRowDoc(tableId)}`;

export const verbs = ['Gets', 'Sets', 'Sets part of', 'Deletes'];

const nouns = [
  THE_STORE,
  'anything',
  'Table Ids',
  'a Table',
  'Row Ids',
  'a Row',
  'Cell Ids',
  'a Cell',
  'invalid Cell changes',
];
