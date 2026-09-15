import {type Client, create} from 'tinyjoin/node';

// Storage is always in-memory: OPFS needs a real browser.
export const getTinyJoinClient = async (): Promise<
  [client: Client, close: () => Promise<void>]
> => {
  const client = await create();
  return [client, () => client.close()];
};
