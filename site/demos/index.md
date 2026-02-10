# Demos

This is a selection of demos that show how TinyBase can be used in real-world
applications.

## TinyHub

[TinyHub](https://github.com/tinyplex/tinyhub) is a blazingly fast local-first
GitHub client, built in public, using TinyBase, React, and GitHub OAuth. You can
try it out [here](https://tinyhub.org).

## TinyRooms

[TinyRooms](https://github.com/tinyplex/tinyrooms) is a local-first app demo,
using TinyBase, PartyKit, and optional GitHub OAuth. You can try it out
[here](https://tinyrooms.jamesgpearce.partykit.dev).

## Docs Search

Even the search feature on this site is powered by TinyBase! The summaries of
all the API documents and guides are loaded into a local Store, indexed in your
browser, and bound to the UI with vanilla JavaScript. The code, if you're
curious, is
[here](https://github.com/tinyplex/tinybase/blob/main/site/js/common/search.ts).

## create-tinybase

You can also use a tool called `create-tinybase` to build simple demo apps and
then extend them to create a full apps of your own. Simply run the following
command to get started:

```bash
npm create tinybase@latest
```

This tool provides the following templates to get started with:

- Todos: a simple todo list app with support for adding, editing, and deleting
  tasks.
- Chat: a real-time chat app with support for multiple rooms and message
  history.
- Drawing: a collaborative drawing app with support for multiple users and
  real-time updates.
- Tic-tac-toe: a turn-based tic-tac-toe game with computed game state and win
  detection.

You can also configure these templates with different options, such as using
TypeScript or JavaScript, adding persistence with SQLite or PGlite, and enabling
synchronization with a remote server or Durable Objects.

## On-site Demos

For the main set of TinyBase demos on this site, we start with the obligatory
'Hello World' example, and then advance from there. Some demos have multiple
versions which start simple and then gain additional functionality with
subsequent iterations.

For a 'kitchen-sink' demo that shows TinyBase really being put through its
paces, take a look at the Drawing demo.

This set of demos should grow over time, so keep checking back!
