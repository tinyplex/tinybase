export const pause = async (ms = 50): Promise<void> =>
  new Promise<void>((resolve) =>
    setTimeout(
      () => setTimeout(() => setTimeout(resolve, 1), Math.max(ms - 2, 1)),
      1,
    ),
  );

export const noop = () => undefined;
