import type {Persister} from 'tinybase/persisters';
import {type LocalPersister} from 'tinybase/persisters/persister-browser';

class AutosaveManager<_T extends Persister> {}

// TS error on the line below
class _SettingsAutosaveManager extends AutosaveManager<LocalPersister> {}
