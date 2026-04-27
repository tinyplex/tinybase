# Testing

Testing is a first-class citizen in TinyBase, as you may see from the high
coverage it enjoys.

All testing is coordinated by Jest, and test are all found in the `test`
directory within the project.

The unit tests (in the `unit` subdirectory), given their names and test titles,
should be self-explanatory - there's typically one or two per main module. Note
that the tests are run against the debug build of the modules, so they require
the `compileForTest` task to have been run, as described in the Developing
TinyBase guide.

Interestingly, the unit tests also include testing all the code snippets in the
API documentation and the guides. This means that it's guaranteed that all
example code will run correctly, and also (given the number of docs) provides a
little bit of extra coverage. The magic to do this (which is alarmingly
dependent on regular expressions) is in the `documentation.test.ts` file.

There are a few helper functions for the tests. These do things like track
listener calls and enumerate complex object structures so they can be easily
asserted with.

The `perf` subdirectory contains the performance tests. These benchmark large
numbers of operations to check for time-complexity. Note that TinyBase
performance tests do not have particularly aggressive pass or fail thresholds
per se, since the absolute numbers will depend on underlying hardware. However,
every test will render an ASCII chart which should be relatively flat. The idea
here is that you can check visually that you haven't introduced a high
time-complexity algorithm bug. For example:

```
Grow store, different table to index with multiple row count, µs per row
First: 16.3 µs per row
 Last: 3.61 µs per row
  Min: 2.76 µs per row
  Max: 29.89 µs per row
  Avg: 7.33 µs per row

      90.00 ┼───────────────────────────────────────
      84.00 ┤
      78.00 ┤
      72.00 ┤
      66.00 ┤
      60.00 ┤
      54.00 ┤
      48.00 ┤
      42.00 ┤
      36.00 ┤
      30.00 ┤╭╮
      24.00 ┤││     ╭╮
      18.00 ┼╯│     ││         ╭╮
      12.00 ┤ ╰╮   ╭╯│    ╭╮   ││          ╭╮
       6.00 ┼──╰───╯─╰────╯╰───╯╰──────────╯╰╮──╭───
       0.00 ┤                                ╰──╯
```

Finally, the end-to-end tests in the `e2e` subdirectory run Puppeteer scripts to
drive simple transactions through the demos on the TinyBase website. These are
good ways of catching major regressions when more complex apps are put together.
