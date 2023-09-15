import {GetTransactionChanges, Store, Tables, Values} from '../types/store';
import {
  PUT,
  SET_CHANGES,
  STORE_PATH,
  constructMessage,
  deconstructMessage,
} from './partykit/common';
import {Persister, PersisterListener} from '../types/persisters';
import PartySocket from 'partysocket';
import {createCustomPersister} from '../persisters';
import {createPartyKitPersister as createPartyKitPersisterDecl} from '../types/persisters/persister-partykit-client';
import {jsonString} from '../common/json';

type MessageListener = (event: MessageEvent) => void;

const MESSAGE = 'message';

export const createPartyKitPersister = ((
  store: Store,
  connection: PartySocket,
  onIgnoredError?: (error: any) => void,
): Persister => {
  let storeUrl: URL;
  const getStoreUrl = () => {
    if (!storeUrl) {
      storeUrl = new URL(connection.url);
      storeUrl.protocol = location.protocol;
      storeUrl.pathname =
        storeUrl.pathname.replace('/party/', '/parties/main/') + STORE_PATH;
      storeUrl.search = '';
    }
    return storeUrl;
  };

  const getOrSetStore = async (content?: [Tables, Values]) => {
    return await (
      await fetch(
        getStoreUrl(),
        content ? {method: PUT, body: jsonString(content)} : undefined,
      )
    ).json();
  };

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
