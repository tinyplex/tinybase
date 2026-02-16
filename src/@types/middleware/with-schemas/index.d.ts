/// middleware
import type {OptionalSchemas, Store} from '../../store/with-schemas/index.d.ts';

/// Middleware
export interface Middleware<in out Schemas extends OptionalSchemas> {
  /// Middleware.getStore
  getStore(): Store<Schemas>;

  /// Middleware.destroy
  destroy(): void;
}

/// createMiddleware
export function createMiddleware<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
): Middleware<Schemas>;
