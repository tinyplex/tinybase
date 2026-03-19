import type {PersisterListener} from '../../@types/persisters/index.d.ts';
import type {
  RemotePersister,
  createRemotePersister as createRemotePersisterDecl,
} from '../../@types/persisters/persister-remote/index.d.ts';
import type {Content, Store} from '../../@types/store/index.d.ts';
import {jsonParse, jsonStringWithMap} from '../../common/json.ts';
import {startInterval, stopInterval} from '../../common/other.ts';
import {createCustomPersister} from '../common/create.ts';

const getETag = (response: Response) => response.headers.get('ETag') ?? '';

export const createRemotePersister = ((
  store: Store,
  loadUrl: string,
  saveUrl: string,
  autoLoadIntervalSeconds = 5,
  onIgnoredError?: (error: any) => void,
): RemotePersister => {
  let lastEtag: string = '';

  const getPersisted = async (): Promise<Content> => {
    const response = await fetch(loadUrl, {
      headers: {'If-None-Match': lastEtag},
    });
    lastEtag = getETag(response);
    console.log([...response.headers.entries()], lastEtag);
    return jsonParse(await response.text());
  };

  const setPersisted = async (getContent: () => Content): Promise<any> =>
    await fetch(saveUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: jsonStringWithMap(getContent()),
    });

  const addPersisterListener = (
    listener: PersisterListener,
  ): number | NodeJS.Timeout =>
    startInterval(async () => {
      const response = await fetch(loadUrl, {
        method: 'HEAD',
        headers: {'If-None-Match': lastEtag},
      });
      const currentEtag = getETag(response);
      if (currentEtag != lastEtag) {
        lastEtag = currentEtag;
        listener();
      }
    }, autoLoadIntervalSeconds);

  const delPersisterListener = (interval: number | NodeJS.Timeout): void =>
    stopInterval(interval);

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    1, // StoreOnly,
    {getUrls: () => [loadUrl, saveUrl]},
  ) as RemotePersister;
}) as typeof createRemotePersisterDecl;
