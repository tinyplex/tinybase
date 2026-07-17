import {getWsServerDurableObjectFetch} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';

const fetch = getWsServerDurableObjectFetch('MyDurableObjects');

true satisfies [Response | Promise<Response>] extends [ReturnType<typeof fetch>]
  ? true
  : false;
