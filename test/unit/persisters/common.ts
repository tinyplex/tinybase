import {
  Changes,
  Content,
  MergeableContent,
  Persister,
  Store,
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
  getPersister: (store: Store, location: Location) => Persister;
  get: (location: Location) => Promise<Content | MergeableContent | void>;
  set: (
    location: Location,
    content: Content | MergeableContent,
  ) => Promise<void>;
  write: (location: Location, rawContent: any) => Promise<void>;
  del: (location: Location) => Promise<void>;
  afterEach?: (location: Location) => void;
  getChanges?: () => Changes;
  testMissing: boolean;
  extraLoad?: 0 | 1;
};

export const nextLoop = async (mockedTimers = false): Promise<void> =>
  await pause(0, mockedTimers);
// fs.watch misses changes made in the same loop, seemingly
