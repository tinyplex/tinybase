# How The Demos Work

The demos on the TinyBase site deserve a little explanation.

For example, take a look at the Todo App v1 (the basics) demo. It contains a
guide that explains each part of the demo step-by-step, whether HTML,
JavaScript, or LESS. And then at the top of the page, the demo actually runs.

Rather than trying to keep prose and running demo in sync, something interesting
here is that the code _in_ the guide is exactly what is compiled together at
build time to create the running demo.

Basically all of the code from the guide is concatenated together into a single
file: the HTML snippets at the start, then the JavaScript snippets inline, and
then the LESS (processed into CSS) inline as styles. THe resulting 'single-file'
HTML is then minified and attached to an iframe (via the `srcdoc` attribute) so
that it is nicely sandboxed.

When a demo is an enhancement to an existing one (such as the Todo App v2
(indexes) demo), the guide will contain diffs. These are also actively applied
to the previous code. It's a little tricky to make sure the diffs always apply
cleanly when you update preceding demo guides, but it reduces repetition.

Finally, some client-side JavaScript makes it possible to launch the demos into
CodePen via their pre-fill API.
