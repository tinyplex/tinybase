import {Persister, PersisterListener} from '../types/persisters';
import {Store, Tables, Values} from '../types/store';
import {jsonParse, jsonString} from '../common/json';
import {createCustomPersister} from '../persisters';
import {createRemotePersister as createRemotePersisterDecl} from '../types/persisters/persister-remote';
import {isUndefined} from '../common/other';

const getETag = (response: Response) => response.headers.get('ETag');

export const createRemotePersister = ((
  store: Store,
  loadUrl: string,
  saveUrl: string,
  autoLoadIntervalSeconds: number,
  onIgnoredError?: (error: any) => void,
): Persister => {
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
    setInterval(async () => {
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
    }, autoLoadIntervalSeconds * 1000);

  const delPersisterListener = (interval: NodeJS.Timeout): void =>
    clearInterval(interval);

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
  );
}) as typeof createRemotePersisterDecl;
