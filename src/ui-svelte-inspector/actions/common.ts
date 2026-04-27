import type {Id} from '../../@types/common/index.d.ts';

export type OnDoneProp = {readonly onDone: () => void};

type BaseAction = {
  readonly icon: string;
  readonly title: string;
  readonly prompt: string;
};

export type NewIdAction = BaseAction & {
  readonly suggestedId: Id;
  readonly has: (id: Id) => boolean;
  readonly set: (newId: Id) => void;
};

export type DeleteAction = BaseAction & {
  readonly onClick: () => void;
};

export type InspectorAction = NewIdAction | DeleteAction;

export const isNewIdAction = (action: InspectorAction): action is NewIdAction =>
  'set' in action;
