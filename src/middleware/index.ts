import type {
  Middleware,
  createMiddleware as createMiddlewareDecl,
} from '../@types/middleware/index.d.ts';
import type {Store} from '../@types/store/index.d.ts';
import {getCreateFunction} from '../common/definable.ts';
import {objFreeze} from '../common/obj.ts';

export const createMiddleware = getCreateFunction(
  (store: Store): Middleware => {
    const getStore = (): Store => store;

    const destroy = (): void => {};

    const middleware: any = {
      getStore,
      destroy,
    };

    return objFreeze(middleware as Middleware);
  },
) as typeof createMiddlewareDecl;
