import {Callback, Json} from '../common.d';
import {
  Persister,
  createRemotePersister as createRemotePersisterDecl,
} from '../persisters.d';
import {ifNotUndefined, isUndefined} from '../common/other';
import {Store} from '../store.d';
import {createCustomPersister} from './common';

const getETag = (response: Response) => response.headers.get('ETag');

export const createRemotePersister = ((
  store: Store,
  loadUrl: string,
  saveUrl: string,
  autoLoadIntervalSeconds: number,
): Persister => {
  let interval: NodeJS.Timeout | undefined;
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

  const startListeningToPersisted = (didChange: Callback): void => {
    interval = setInterval(async () => {
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
  };

  const stopListeningToPersisted = (): void => {
    ifNotUndefined(interval, clearInterval);
    interval = undefined;
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    startListeningToPersisted,
    stopListeningToPersisted,
  );
}) as typeof createRemotePersisterDecl;
