# Architectural Options

This guide discusses some of the ways in which you can use TinyBase, and how you
can architect it into the bigger picture of how your app is built.

Before we go any further, remember that TinyBase is an in-memory data store that
runs within a JavaScript environment like a browser or a worker. Whilst it can
theoretically stand alone in a simple app, you'll probably want to preserve,
share, or sync the data between reloads and sessions.

And so a lot of what we're discussing in the guide is how to integrate TinyBase
with persistence and synchronization techniques - whether on the client or the
server, or both.

## 0. Standalone TinyBase

In this option, a TinyBase Store is instantiated when the app runs. During its
use, data is added or updated, and rendered accordingly. When the app is
reloaded or closed, the data is lost.

![Standalone TinyBase](/arch0.svg 'Standalone TinyBase')

This is very simple to set up, and good for prototyping or small apps. The Todo
App v1 (the basics) demo is a good example of how to get started like this. But
it's pretty limited - especially if you're expecting your users' data to show up
again the next time they use the app!

## Summary

TinyBase provides many different architectural choices, depending on the type of
app you are building, and where you want the data to reside when not in use.

Next we will show how you can quickly build user interfaces on top of a Store,
and for that, it's time to proceed to the Building UIs guide.
