/// persister-file

import {Persister} from './persisters';
import {Store} from './store';

/// createFilePersister
export function createFilePersister(store: Store, filePath: string): Persister;
