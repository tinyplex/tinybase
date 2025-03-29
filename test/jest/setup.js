jest.retryTimes(10);

afterEach(() => {
  const {assertionCalls} = expect.getState();
  global.env.tests += 1;
  global.env.assertions += assertionCalls;
});
