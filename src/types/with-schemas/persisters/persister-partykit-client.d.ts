/// persister-partykit-client

import {OptionalSchemas, Store} from '../store';
import PartySocket from 'partysocket';
import {Persister} from '../persisters';

/// PartyKitPersisterConfig
export type PartyKitPersisterConfig = {
  /// PartyKitPersisterConfig.storeProtocol
  storeProtocol?: 'http' | 'https';
  /// PartyKitPersisterConfig.storePath
  storePath?: string;
};

/// createPartyKitPersister
export function createPartyKitPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  connection: PartySocket,
  configOrStoreProtocol?: PartyKitPersisterConfig | 'http' | 'https',
  onIgnoredError?: (error: any) => void,
): Persister<Schemas>;
