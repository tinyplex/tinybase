import {getWsServerDurableObjectFetch} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';

const _fetch = getWsServerDurableObjectFetch('MyDurableObjects');

true satisfies [Response | Promise<Response>] extends [
  ReturnType<typeof _fetch>,
]
  ? true
  : false;
