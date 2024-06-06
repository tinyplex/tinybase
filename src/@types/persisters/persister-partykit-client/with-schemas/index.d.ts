/// persister-partykit-client

import type {OptionalSchemas, Store} from '../../../store/with-schemas';
import PartySocket from 'partysocket';
import type {Persister} from '../../with-schemas';

/// PartyKitPersister
export interface PartyKitPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas> {
  /// PartyKitPersister.getConnection
  getConnection(): PartySocket;
}

/// PartyKitPersisterConfig
export type PartyKitPersisterConfig = {
  /// PartyKitPersisterConfig.storeProtocol
  storeProtocol?: 'http' | 'https';
  /// PartyKitPersisterConfig.storePath
  storePath?: string;
  /// PartyKitPersisterConfig.messagePrefix
  messagePrefix?: string;
};

/// createPartyKitPersister
export function createPartyKitPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  connection: PartySocket,
  configOrStoreProtocol?: PartyKitPersisterConfig | 'http' | 'https',
  onIgnoredError?: (error: any) => void,
): PartyKitPersister<Schemas>;
