import type {PersisterListener} from '../../@types/persisters/index.d.ts';
import type {
  RemotePersister,
  createRemotePersister as createRemotePersisterDecl,
} from '../../@types/persisters/persister-remote/index.d.ts';
import type {Content, Store} from '../../@types/store/index.d.ts';
import {jsonParse, jsonStringWithMap} from '../../common/json.ts';
import {startInterval, stopInterval} from '../../common/other.ts';
import {EMPTY_STRING} from '../../common/strings.ts';
import {createCustomPersister} from '../common/create.ts';

const getETag = (response: Response) =>
  response.headers.get('ETag') ?? EMPTY_STRING;
const getIfNoneMatchHeaders = (lastEtag: string): HeadersInit | undefined =>
  lastEtag == EMPTY_STRING ? undefined : {'If-None-Match': lastEtag};

export const createRemotePersister = ((
  store: Store,
  loadUrl: string,
  saveUrl: string,
  autoLoadIntervalSeconds = 5,
  onIgnoredError?: (error: any) => void,
): RemotePersister => {
  let lastEtag: string = EMPTY_STRING;

  const getPersisted = async (): Promise<Content> => {
    const response = await fetch(loadUrl, {
      headers: getIfNoneMatchHeaders(lastEtag),
    });
    const content = jsonParse(await response.text());
    lastEtag = getETag(response);
    return content;
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
        headers: getIfNoneMatchHeaders(lastEtag),
      });
      const currentEtag = getETag(response);
      if (currentEtag != lastEtag) {
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
