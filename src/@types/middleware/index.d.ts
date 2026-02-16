/// middleware
import type {Store} from '../store/index.d.ts';

/// Middleware
export interface Middleware {
  /// Middleware.getStore
  getStore(): Store;

  /// Middleware.destroy
  destroy(): void;
}

/// createMiddleware
export function createMiddleware(store: Store): Middleware;
