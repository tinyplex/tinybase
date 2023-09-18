/// persister-partykit-client

import {OptionalSchemas, Store} from '../store';
import PartySocket from 'partysocket';
import {Persister} from '../persisters';

/// createPartyKitPersister
export function createPartyKitPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  connection: PartySocket,
  storeUrlProtocol?: 'http' | 'https',
  onIgnoredError?: (error: any) => void,
): Persister<Schemas>;
