import type {Content, Store} from '../../@types/store/index.d.ts';
import {Persistables, createCustomPersister} from '../index.ts';
import type {
  RemotePersister,
  createRemotePersister as createRemotePersisterDecl,
} from '../../@types/persisters/persister-remote/index.d.ts';
import {isUndefined, startInterval, stopInterval} from '../../common/other.ts';
import {jsonParse, jsonStringWithMap} from '../../common/json.ts';
import type {PersisterListener} from '../../@types/persisters/index.d.ts';

const getETag = (response: Response) => response.headers.get('ETag');

export const createRemotePersister = ((
  store: Store,
  loadUrl: string,
  saveUrl: string,
  autoLoadIntervalSeconds = 5,
  onIgnoredError?: (error: any) => void,
): RemotePersister => {
  let lastEtag: string | null;

  const getPersisted = async (): Promise<Content> => {
    const response = await fetch(loadUrl);
    lastEtag = getETag(response);
    return jsonParse(await response.text());
  };

  const setPersisted = async (getContent: () => Content): Promise<any> =>
    await fetch(saveUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: jsonStringWithMap(getContent()),
    });

  const addPersisterListener = (listener: PersisterListener): NodeJS.Timeout =>
    startInterval(async () => {
      const response = await fetch(loadUrl, {method: 'HEAD'});
      const currentEtag = getETag(response);
      if (
        !isUndefined(lastEtag) &&
        !isUndefined(currentEtag) &&
        currentEtag != lastEtag
      ) {
        lastEtag = currentEtag;
        listener();
      }
    }, autoLoadIntervalSeconds);

  const delPersisterListener = (interval: NodeJS.Timeout): void =>
    stopInterval(interval);

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    Persistables.StoreOnly,
    {getUrls: () => [loadUrl, saveUrl]},
  ) as RemotePersister;
}) as typeof createRemotePersisterDecl;
