import {getWsServerDurableObjectFetch} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
import {Message} from 'tinybase/synchronizers/with-schemas';

const _fetch = getWsServerDurableObjectFetch('MyDurableObjects');

true satisfies [Response | Promise<Response>] extends [
  ReturnType<typeof _fetch>,
]
  ? true
  : false;

const sendWithSchemas: import('tinybase/synchronizers/with-schemas').Send =
  () => {};
sendWithSchemas(null, null, Message.Response, null);

const receiveWithSchemas: import('tinybase/synchronizers/with-schemas').Receive =
  () => {};
receiveWithSchemas('', null, Message.Response, null);
