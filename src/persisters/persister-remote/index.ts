import type {PersisterListener} from '../../@types/persisters/index.d.ts';
import type {
  RemotePersister,
  createRemotePersister as createRemotePersisterDecl,
} from '../../@types/persisters/persister-remote/index.d.ts';
import type {Content, Store} from '../../@types/store/index.d.ts';
import {tryCatch, tryFinallyAsync, tryReturn} from '../../common/error.ts';
import {jsonParse, jsonStringWithMap} from '../../common/json.ts';
import {isUndefined, startInterval, stopInterval} from '../../common/other.ts';
import {EMPTY_STRING} from '../../common/strings.ts';
import {createCustomPersister} from '../common/create.ts';

const getETag = (response: Response) =>
  response.headers.get('ETag') ?? EMPTY_STRING;
const getIfNoneMatchHeaders = (lastEtag: string): HeadersInit | undefined =>
  lastEtag == EMPTY_STRING ? undefined : {'If-None-Match': lastEtag};
const checkResponse = (response: Response, allowNotModified?: 1): void => {
  if (!response.ok && (!allowNotModified || response.status != 304)) {
    throw response;
  }
};

type ListenerHandle = [
  interval: number | NodeJS.Timeout,
  stop: () => Promise<void>,
];

export const createRemotePersister = ((
  store: Store,
  loadUrl: string,
  saveUrl: string,
  autoLoadIntervalSeconds = 5,
  onIgnoredError?: (error: any) => void,
): RemotePersister => {
  let lastEtag: string = EMPTY_STRING;
  let lastContent: string | undefined;

  const getPersisted = async (): Promise<Content> => {
    const response = await fetch(loadUrl, {
      headers: getIfNoneMatchHeaders(lastEtag),
    });
    const notModified = response.status == 304 && !isUndefined(lastContent);
    checkResponse(response, notModified ? 1 : undefined);
    const contentText = notModified
      ? (lastContent as string)
      : await response.text();
    const content = jsonParse(contentText);
    if (!notModified) {
      lastContent = contentText;
      lastEtag = getETag(response);
    }
    return content;
  };

  const setPersisted = async (getContent: () => Content): Promise<void> => {
    const response = await fetch(saveUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: jsonStringWithMap(getContent()),
    });
    await tryFinallyAsync(
      async () => checkResponse(response),
      () => response.body?.cancel(),
    );
  };

  const addPersisterListener = (
    listener: PersisterListener,
  ): ListenerHandle => {
    let active: Promise<void> | undefined;
    let controller: AbortController | undefined;
    let stopped = false;
    const poll = (): void => {
      if (!stopped && isUndefined(active)) {
        controller = new AbortController();
        active = tryFinallyAsync(
          () =>
            tryCatch(
              async () => {
                const response = await fetch(loadUrl, {
                  method: 'HEAD',
                  headers: getIfNoneMatchHeaders(lastEtag),
                  signal: controller?.signal,
                });
                checkResponse(response, 1);
                if (
                  !stopped &&
                  response.status != 304 &&
                  getETag(response) != lastEtag
                ) {
                  await listener();
                }
              },
              (error) =>
                stopped ? 0 : tryReturn(() => onIgnoredError?.(error)),
            ),
          () => {
            active = undefined;
            controller = undefined;
          },
        );
      }
    };
    return [
      startInterval(poll, autoLoadIntervalSeconds),
      async () => {
        stopped = true;
        controller?.abort();
        await active;
      },
    ];
  };

  const delPersisterListener = async ([
    interval,
    stop,
  ]: ListenerHandle): Promise<void> => {
    const stopped = stop();
    stopInterval(interval);
    await stopped;
  };

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
