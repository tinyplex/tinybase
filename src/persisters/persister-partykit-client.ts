import {GetTransactionChanges, Store, Tables, Values} from '../types/store';
import {
  PUT,
  SET_CHANGES,
  STORE_PATH,
  constructMessage,
  deconstructMessage,
} from './partykit/common';
import {
  PartyKitPersisterConfig,
  createPartyKitPersister as createPartyKitPersisterDecl,
} from '../types/persisters/persister-partykit-client';
import {Persister, PersisterListener} from '../types/persisters';
import PartySocket from 'partysocket';
import {createCustomPersister} from '../persisters';
import {isString} from '../common/other';
import {jsonString} from '../common/json';

type MessageListener = (event: MessageEvent) => void;

const MESSAGE = 'message';
const DEFAULT_CONFIG = {
  storeProtocol: 'https',
  storePath: STORE_PATH,
};

export const createPartyKitPersister = ((
  store: Store,
  connection: PartySocket,
  configOrStoreProtocol?: PartyKitPersisterConfig | 'http' | 'https',
  onIgnoredError?: (error: any) => void,
): Persister => {
  const {host, room} = connection.partySocketOptions;
  const {storeProtocol, storePath} = {
    ...DEFAULT_CONFIG,
    ...(isString(configOrStoreProtocol)
      ? {storeProtocol: configOrStoreProtocol}
      : configOrStoreProtocol),
  };
  const storeUrl =
    storeProtocol +
    '://' +
    host +
    '/parties/' +
    ((connection as any).name ?? 'main') +
    '/' +
    room +
    storePath;

  const getOrSetStore = async (content?: [Tables, Values]) =>
    await (
      await fetch(storeUrl, {
        ...(content ? {method: PUT, body: jsonString(content)} : {}),
        mode: 'cors',
        cache: 'no-store',
      })
    ).json();

  const getPersisted = async (): Promise<[Tables, Values]> =>
    await getOrSetStore();

  const setPersisted = async (
    getContent: () => [Tables, Values],
    getTransactionChanges?: GetTransactionChanges,
  ): Promise<void> => {
    if (getTransactionChanges) {
      connection.send(constructMessage(SET_CHANGES, getTransactionChanges()));
    } else {
      await getOrSetStore(getContent());
    }
  };

  const addPersisterListener = (
    listener: PersisterListener,
  ): MessageListener => {
    const messageListener = (event: MessageEvent) => {
      const [type, payload] = deconstructMessage(event.data, 1);
      if (type == SET_CHANGES) {
        listener(undefined, () => payload);
      }
    };
    connection.addEventListener(MESSAGE, messageListener);
    return messageListener;
  };

  const delPersisterListener = (messageListener: MessageListener): void => {
    connection.removeEventListener(MESSAGE, messageListener);
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
  );
}) as typeof createPartyKitPersisterDecl;
