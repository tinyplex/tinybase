# Documentation

Like testing, documentation is a first-class citizen of TinyBase, and most of it
is structured as API documentation (from the `.d.ts` files) and from markdown
pages.

TinyBase uses a library called TinyDocs that wraps TypeDoc to parse and render
documentation that's inline in the type declarations. Every type, function, and
interface is documented, categorized, and given an example - there's even an
ESLint rule to guarantee it!

The documentation is rendered as static HTML pages to be served by GitHub Pages,
and there is some light JavaScript added to provide a pseudo single-page
navigation experience.

All documentation is spell-checked with CSpell.
