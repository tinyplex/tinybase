import {
  NoPropComponent,
  useBaseUrl,
  useIsSingle,
  usePageNode,
  useRootNode,
} from 'tinydocs';
import {BuildContext} from './BuildContext';
import {Footer} from './Footer';
import {Header} from './Header';
import {Main} from './Main';
import React from 'react';

const FONTS = [
  'lato-light',
  'lato-regular',
  'roboto-thin',
  'roboto-light',
  'roboto-mono-light',
  'roboto-mono-regular',
];

export const Page: NoPropComponent = () => {
  const pageNode = usePageNode();
  const rootNode = useRootNode();
  const isSingle = useIsSingle();
  const baseUrl = useBaseUrl();
  const isHome = pageNode == rootNode;

  const title =
    (pageNode.name != 'TinyBase' ? pageNode.name + ' | ' : '') + 'TinyBase';
  const description = isHome
    ? 'A tiny, reactive JavaScript library ' +
      'for structured state and tabular data.'
    : pageNode.summary;

  return (
    <BuildContext>
      <html>
        <head>
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
          <meta property="og:type" content="website" />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:url" content={`${baseUrl}${pageNode.url}`} />
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
          <script
            src={`/js/${isHome ? 'home' : isSingle ? 'single' : 'app'}.js`}
          />
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-D1MGR8VRWJ"
          />
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html:
                `window.dataLayer=window.dataLayer||[];` +
                `function g(){dataLayer.push(arguments);}` +
                `g('js',new Date());` +
                `g('config','G-D1MGR8VRWJ');`,
            }}
          />
        </head>
        <body>
          <Header />
          <Main />
          <Footer />
        </body>
      </html>
    </BuildContext>
  );
};
