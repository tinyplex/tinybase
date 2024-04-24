import {Changes, Content, Store} from '../types/store';
import {
  PUT,
  SET_CHANGES,
  STORE_PATH,
  construct,
  deconstruct,
} from './partykit/common';
import {
  PartyKitPersister,
  PartyKitPersisterConfig,
  createPartyKitPersister as createPartyKitPersisterDecl,
} from '../types/persisters/persister-partykit-client';
import {ifNotUndefined, isString} from '../common/other';
import {EMPTY_STRING} from '../common/strings';
import PartySocket from 'partysocket';
import {PersisterListener} from '../types/persisters';
import {createCustomPersister} from '../persisters';
import {jsonStringWithMap} from '../common/json';

type MessageListener = (event: MessageEvent) => void;

const MESSAGE = 'message';

export const createPartyKitPersister = ((
  store: Store,
  connection: PartySocket,
  configOrStoreProtocol?: PartyKitPersisterConfig | 'http' | 'https',
  onIgnoredError?: (error: any) => void,
): PartyKitPersister => {
  const {host, room} = connection.partySocketOptions;
  const {
    storeProtocol = 'https',
    storePath = STORE_PATH,
    messagePrefix = EMPTY_STRING,
  } = {
    ...(isString(configOrStoreProtocol)
      ? {storeProtocol: configOrStoreProtocol}
      : configOrStoreProtocol),
  };
  const storeUrl =
    storeProtocol +
    '://' +
    host +
    '/parties/' +
    connection.name +
    '/' +
    room +
    storePath;

  const getOrSetStore = async (content?: Content) =>
    await (
      await fetch(storeUrl, {
        ...(content ? {method: PUT, body: jsonStringWithMap(content)} : {}),
        mode: 'cors',
        cache: 'no-store',
      })
    ).json();

  const getPersisted = async (): Promise<Content> => await getOrSetStore();

  const setPersisted = async (
    getContent: () => Content,
    changes?: Changes,
  ): Promise<void> => {
    if (changes) {
      connection.send(construct(messagePrefix, SET_CHANGES, changes));
    } else {
      await getOrSetStore(getContent());
    }
  };

  const addPersisterListener = (
    listener: PersisterListener,
  ): MessageListener => {
    const messageListener = (event: MessageEvent) =>
      ifNotUndefined(
        deconstruct(messagePrefix, event.data, 1),
        ([type, payload]) => {
          if (type == SET_CHANGES) {
            listener(undefined, () => payload);
          }
        },
      );
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
    false,
    {getConnection: () => connection},
  ) as PartyKitPersister;
}) as typeof createPartyKitPersisterDecl;
