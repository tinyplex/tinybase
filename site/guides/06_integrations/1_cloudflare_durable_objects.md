# Cloudflare Durable Objects

Durable Objects are a new type of serverless compute platform from Cloudflare,
and provide a way to run stateful applications in a serverless environment,
without needing to manage infrastructure.

## What Are Durable Objects?

Each Durable Object can function as a WebSocket server, so it can co-ordinate
messages between multiple clients. But importantly, it also has private,
transactional and strongly consistent storage attached. Combined with a TinyBase
Store on the client, and using the built-in synchronization and persistence
functionality, this gives you an full-stack way to build complex, real-time,
multi-device (and even collaborative) apps.

![Durable Objects](/durable.svg 'Durable Objects')

As this guide hopefully shows, this can be done with minimal effort!

## Getting Started with Vite

The quickest way to get started with TinyBase and Cloudflare Durable Objects is
to use our [Vite
template](https://github.com/tinyplex/vite-tinybase-ts-react-sync-durable-object).
This includes both a client implementation (that by default connects to a demo
server we provide) and a server implementation that you can instead use for your
own Cloudflare installation.

<img width="847" alt="image" src="https://github.com/user-attachments/assets/c63f2789-94dd-4fd3-a5eb-e929c7b4897c">

### Install The Client

1. Make a copy of the template into a new directory:

```sh
npx tiged tinyplex/vite-tinybase-ts-react-sync-durable-object my-tinybase-app
```

2. Go into the client directory:

```sh
cd my-tinybase-app/client
```

3. Install the dependencies:

```sh
npm install
```

4. Run the application:

```sh
npm run dev
```

5. Go the URL shown and enjoy!

### Run Your Own Server

This template uses a lightweight socket server on `vite.tinybase.cloud` to
synchronize data between clients. This is fine for a demo but not intended as a
production server for your apps!

If you wish to run your own instance, see the `server` directory and start from
there.

The `vite.tinybase.cloud` server is hosted on Cloudflare and so if you choose to
use that, you can reuse the wrangler.toml configuration in the server directory.
Just remember to update it to match your account, domains, and required
configuration. In the `index.ts` file, you can configure whether data will be
stored in the Durable Object or just synchronized between clients.

You will also have to have your client communicate with your new server by
configuring the `SERVER` constant at the top of the client's `App.tsx` file.

## How It All Works
