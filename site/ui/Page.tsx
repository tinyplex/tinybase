import {
  NodeSummary,
  useBaseUrl,
  useIsSingle,
  usePageNode,
  useRootNode,
} from 'tinydocs';
import {BuildContext} from './BuildContext.tsx';
import {Footer} from './Footer.tsx';
import {Header} from './Header.tsx';
import {Main} from './Main.tsx';
import type {NoPropComponent} from 'tinydocs';
import React from 'react';

const GTM_ID = 'G-D1MGR8VRWJ';

const FONTS = ['inter', 'inconsolata', 'icons', 'shantell'];

export const Page: NoPropComponent = () => {
  const pageNode = usePageNode();
  const rootNode = useRootNode();
  const isSingle = useIsSingle();
  const baseUrl = useBaseUrl();
  const isHome = pageNode == rootNode;

  if (pageNode.summary?.startsWith('->')) {
    return (
      <meta
        httpEquiv="refresh"
        content={`0;url=${pageNode.summary.substring(2).trim()}`}
      />
    );
  }

  const title =
    (pageNode.name != 'TinyBase' ? pageNode.name + ' | ' : '') + 'TinyBase';
  const description = isHome
    ? 'The reactive data store for local-first apps.'
    : (NodeSummary({node: pageNode, asText: true}) as any);
  const url = `${baseUrl}${pageNode.url}`;

  return (
    <BuildContext>
      <html lang="en">
        <head>
          <link rel="dns-prefetch" href="https://www.googletagmanager.com/" />
          <link
            href={`https://www.googletagmanager.com/gtag/js?id=${GTM_ID}`}
            rel="preload"
            as="script"
          />
          {FONTS.map((font) => (
            <link
              rel="preload"
              as="font"
              href={`/fonts/${font}.woff2`}
              type="font/woff2"
              crossOrigin="anonymous"
              key={font}
            />
          ))}

          <title>{title}</title>
          <meta name="description" content={description} />

          <meta property="og:type" content="website" />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:url" content={url} />
          <meta property="og:image" content={`${baseUrl}/favicon_pad.png`} />

          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:site" content="@tinybasejs" />
          <meta name="twitter:image" content={`${baseUrl}/favicon_pad.png`} />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="stylesheet" href="/css/index.css" />
          <link rel="canonical" href={url} />

          <script
            src={`/js/${isHome ? 'home' : isSingle ? 'single' : 'app'}.js`}
          />
        </head>
        <body>
          <Header />
          <Main />
          <Footer />
        </body>
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GTM_ID}`}
        />
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html:
              `window.dataLayer=window.dataLayer||[];` +
              `function g(){dataLayer.push(arguments);}` +
              `g('js',new Date());` +
              `g('config','${GTM_ID}');`,
          }}
        />
      </html>
    </BuildContext>
  );
};
