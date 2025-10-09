import type {
  Changes,
  Content,
  MergeableChanges,
  MergeableContent,
  MergeableStore,
  Store,
} from 'tinybase';
import type {Persister, Persists} from 'tinybase/persisters';

export const asyncNoop = async () => undefined;

export type GetLocationMethod<Location = string> = [
  string,
  (location: Location) => unknown,
];

export type Persistable<Location = string> = {
  beforeEach?: () => void;
  autoLoadPause?: number;
  getLocation: () => Promise<Location>;
  getLocationMethod?: GetLocationMethod<Location>;
  getPersister: (
    store: Store | MergeableStore,
    location: Location,
  ) => Persister<Persists> | Promise<Persister<Persists>>;
  get: (location: Location) => Promise<Content | MergeableContent | void>;
  set: (
    location: Location,
    content: Content | MergeableContent,
  ) => Promise<void>;
  write: (location: Location, rawContent: any) => Promise<void>;
  del: (location: Location) => Promise<void>;
  afterEach?: (location: Location) => Promise<void>;
  getChanges?: () => Changes | MergeableChanges;
  testMissing: boolean;
  testAutoLoad: boolean;
};
