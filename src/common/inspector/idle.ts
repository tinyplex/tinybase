export const requestInspectorIdleCallback = (
  callback: IdleRequestCallback,
): number =>
  globalThis.requestIdleCallback?.(callback) ??
  (setTimeout(
    () =>
      callback({
        didTimeout: false,
        timeRemaining: () => 0,
      } as IdleDeadline),
    0,
  ) as unknown as number);

export const cancelInspectorIdleCallback = (id: number): void =>
  globalThis.cancelIdleCallback?.(id) ?? clearTimeout(id);
