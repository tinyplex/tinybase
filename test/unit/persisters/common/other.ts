import type {
  Changes,
  Content,
  MergeableChanges,
  MergeableContent,
  MergeableStore,
  Store,
} from 'tinybase';
import type {Persister, Persists} from 'tinybase/persisters';
import {expect} from 'vitest';
import {pause} from '../../common/other.ts';

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

export const getPersistedContentWaiter =
  <Location>(persistable: Persistable<Location>) =>
  async (
    location: Location,
    content: Content | MergeableContent,
  ): Promise<Content | MergeableContent | void> => {
    const serializedContent = JSON.parse(
      JSON.stringify(content, (_key, value) =>
        value === undefined ? '\uFFFC' : value,
      ),
    );
    for (let attempts = 250; attempts; attempts--) {
      const persisted = await persistable.get(location);
      try {
        expect(persisted).toEqual(content);
        return persisted;
      } catch {
        try {
          expect(persisted).toEqual(serializedContent);
          return persisted;
        } catch (error) {
          if (attempts == 1) {
            throw error;
          }
        }
      }
      await pause(20);
    }
  };
