import type {
  Changes,
  Content,
  MergeableChanges,
  MergeableContent,
  MergeableStore,
  Persister,
  Store,
  StoreTypes,
} from 'tinybase/debug';
import {pause} from '../common/other';

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
  ) => Persister<StoreTypes>;
  get: (location: Location) => Promise<Content | MergeableContent | void>;
  set: (
    location: Location,
    content: Content | MergeableContent,
  ) => Promise<void>;
  write: (location: Location, rawContent: any) => Promise<void>;
  del: (location: Location) => Promise<void>;
  afterEach?: (location: Location) => void;
  getChanges?: () => Changes | MergeableChanges;
  testMissing: boolean;
  extraLoad?: 0 | 1;
};

export const nextLoop = async (alsoNudgeHlc = false): Promise<void> =>
  await pause(0, alsoNudgeHlc);
// fs.watch misses changes made in the same loop, seemingly
