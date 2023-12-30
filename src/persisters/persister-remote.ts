import {
  RemotePersister,
  createRemotePersister as createRemotePersisterDecl,
} from '../types/persisters/persister-remote';
import {Store, Tables, Values} from '../types/store';
import {isUndefined, startInterval, stopInterval} from '../common/other';
import {jsonParse, jsonString} from '../common/json';
import {PersisterListener} from '../types/persisters';
import {createCustomPersister} from '../persisters';

const getETag = (response: Response) => response.headers.get('ETag');

export const createRemotePersister = ((
  store: Store,
  loadUrl: string,
  saveUrl: string,
  autoLoadIntervalSeconds = 5,
  onIgnoredError?: (error: any) => void,
): RemotePersister => {
  let lastEtag: string | null;

  const getPersisted = async (): Promise<[Tables, Values]> => {
    const response = await fetch(loadUrl);
    lastEtag = getETag(response);
    return jsonParse(await response.text());
  };

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<any> =>
    await fetch(saveUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: jsonString(getContent()),
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
    ['getUrls', [loadUrl, saveUrl]],
  ) as RemotePersister;
}) as typeof createRemotePersisterDecl;
