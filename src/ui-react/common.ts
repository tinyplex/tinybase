import {Id, Ids} from '../types/common';
import {IdObj} from '../common/obj';
import {Indexes} from '../types/indexes';
import React from 'react';
import {Relationships} from '../types/relationships';
import {Store} from '../types/store';
import {isUndefined} from '../common/other';

export const {
  PureComponent,
  Fragment,
  createElement,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} = React;

export const getProps = <Props extends IdObj<any>>(
  getProps: ((...ids: Ids) => Props) | undefined,
  ...ids: Ids
): Props => (isUndefined(getProps) ? ({} as Props) : getProps(...ids));

export const getRelationshipsStoreTableIds = (
  relationships: Relationships | undefined,
  relationshipId: Id,
): [
  Relationships | undefined,
  Store | undefined,
  Id | undefined,
  Id | undefined,
] => [
  relationships,
  relationships?.getStore(),
  relationships?.getLocalTableId(relationshipId),
  relationships?.getRemoteTableId(relationshipId),
];

export const getIndexStoreTableId = (
  indexes: Indexes | undefined,
  indexId: Id,
): [Indexes | undefined, Store | undefined, Id | undefined] => [
  indexes,
  indexes?.getStore(),
  indexes?.getTableId(indexId),
];
