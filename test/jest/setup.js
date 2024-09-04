jest.retryTimes(10);

afterEach(
  () => (global.env.assertionCalls += expect.getState().assertionCalls),
);
