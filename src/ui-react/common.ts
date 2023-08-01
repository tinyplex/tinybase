import {IdObj} from '../common/obj';
import {Ids} from '../types/common';
import React from 'react';
import {isUndefined} from '../common/other';

export const {createElement} = React;

export const getProps = <Props extends IdObj<any>>(
  getProps: ((...ids: Ids) => Props) | undefined,
  ...ids: Ids
): Props => (isUndefined(getProps) ? ({} as Props) : getProps(...ids));
