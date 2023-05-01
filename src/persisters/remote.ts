import {Callback, Json} from '../types/common.d';
import {
  Persister,
  createRemotePersister as createRemotePersisterDecl,
} from '../types/persisters.d';
import {Store} from '../types/store.d';
import {createCustomPersister} from './common';
import {isUndefined} from '../common/other';

const getETag = (response: Response) => response.headers.get('ETag');

export const createRemotePersister = ((
  store: Store,
  loadUrl: string,
  saveUrl: string,
  autoLoadIntervalSeconds: number,
): Persister => {
  let lastEtag: string | null;

  const getPersisted = async (): Promise<string | null | undefined> => {
    const response = await fetch(loadUrl);
    lastEtag = getETag(response);
    return response.text();
  };

  const setPersisted = async (json: Json): Promise<any> =>
    await fetch(saveUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: json,
    });

  const startListeningToPersisted = (didChange: Callback): NodeJS.Timeout =>
    setInterval(async () => {
      const response = await fetch(loadUrl, {method: 'HEAD'});
      const currentEtag = getETag(response);
      if (
        !isUndefined(lastEtag) &&
        !isUndefined(currentEtag) &&
        currentEtag != lastEtag
      ) {
        lastEtag = currentEtag;
        didChange();
      }
    }, autoLoadIntervalSeconds * 1000);

  const stopListeningToPersisted = (interval: NodeJS.Timeout): void =>
    clearInterval(interval);

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    startListeningToPersisted,
    stopListeningToPersisted,
  );
}) as typeof createRemotePersisterDecl;
