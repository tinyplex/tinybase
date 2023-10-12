/// persister-partykit-client

import PartySocket from 'partysocket';
import {Persister} from '../persisters';
import {Store} from '../store';

/// PartyKitPersister
export interface PartyKitPersister extends Persister {
  /// PartyKitPersister.getConnection
  getConnection: () => PartySocket;
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
export function createPartyKitPersister(
  store: Store,
  connection: PartySocket,
  configOrStoreProtocol?: PartyKitPersisterConfig | 'http' | 'https',
  onIgnoredError?: (error: any) => void,
): PartyKitPersister;
