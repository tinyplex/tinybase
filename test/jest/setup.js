afterEach(
  () => (global.env.assertionCalls += expect.getState().assertionCalls),
);
