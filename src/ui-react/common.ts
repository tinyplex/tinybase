import {IdObj} from '../common/obj';
import {Ids} from '../types/common';
import {isUndefined} from '../common/other';

export const getProps = <Props extends IdObj<any>>(
  getProps: ((...ids: Ids) => Props) | undefined,
  ...ids: Ids
): Props => (isUndefined(getProps) ? ({} as Props) : getProps(...ids));
