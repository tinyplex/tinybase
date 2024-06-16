jest.retryTimes(3);

afterEach(
  () => (global.env.assertionCalls += expect.getState().assertionCalls),
);
