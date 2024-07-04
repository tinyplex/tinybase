# Developing TinyBase

This guide is for people who would like to checkout the TinyBase code and build
it from source. It's a quick overview of the common workflows.

## Checking Out The Code

Check out the TinyBase repository with the following command (assuming you have
all the dependent tools installed), and install the developer dependencies:

```bash
git clone git@github.com:tinyplex/tinybase.git
cd tinybase
npm install
```

You are good to get started! There are a number of gulp-based workflows
available if you are working on TinyBase, and the following are some of the
important ones:

## Compilation

To compile the Typescript into executable JavaScript you can either choose to do
it quickly into one module for the purposes of testing:

```bash
npm run compileForTest
```

It should take a few seconds at most. Production-ready minified modules take a
little longer:

```bash
npm run compileForProd
```

## Code Quality

Your IDE should be able to do this continuously. But should you wish to check
that Typescript validates the entire codebase and that there are no type errors
or unused exports, use the following:

```bash
npm run ts
```

Similarly, this task ensure the code lints and is all formatted correctly with
prettier:

```bash
npm run lint
```

You can also check that there are no spelling mistakes in the code or
documentation - which is very important!

```bash
npm run spell
```

## Testing

There are three major sets of tests: unit tests, performance tests, and
end-to-end tests of the demos in the TinyBase site. The unit tests,
interestingly, include testing all the inline code and examples in the
documentation.

Unit tests are the most common to run. If the code is already compiled, you can
run these with:

```bash
npm run testUnit
```

Or, while you are iterating on code, the following will compile _and_ unit test
it:

```bash
npm run compileAndTestUnit
```

Performance tests are very similar:

```bash
npm run testPerf
```

...or:

```bash
npm run compileAndTestPerf
```

Every performance test will render an ASCII chart which should be relatively
flat. The idea here is that you can check visually that you haven't introduced a
high time-complexity algorithm bug.

Finally, end-to-end testing validates that the demos on the website work. This
requires you to compile for production, and generate the documentation first:

```bash
npm run compileForProd
npm run compileDocs
npm run testE2e
```

## Documentation

The end-to-end tests will start up their own web server to test the
documentation site, but if you separately want to serve the TinyBase website,
you can use:

```bash
npm run compileDocs
npm run serveDocs
```

This will make the website available on `localhost:8080` (and you probably want
to run the `serveDocs` task in a separate window since it's long-running).

The `compileDocs` task involves generating all the API documentation which can
be a little slow. If you just want to work on the website styling or
interactivity you can instead just compile the assets:

```bash
npm run compileDocsAssetsOnly
```

And if you are working on just the demos or guides, the following generates just
those:

```bash
npm run compileDocsPagesOnly
```

This removes all the API documentation though, so don't forget to run a full
`compileDocs` task again before finally committing code.

## The Master Check

To make sure everything is in decent shape before committing or publishing to
npm, this task is a superset of everything:

```bash
npm run prePublishPackage
```

That's it, and see you in the pull requests!
