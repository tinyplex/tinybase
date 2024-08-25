jest.retryTimes(5);

afterEach(
  () => (global.env.assertionCalls += expect.getState().assertionCalls),
);
