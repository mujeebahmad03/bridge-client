/* eslint-disable react/no-danger */
import Head from "next/head";

import { JsonLd } from "./json-ld";

const RootHeader = () => {
  return (
    <Head>
      <JsonLd />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="dns-prefetch" href="https://analytics.google.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

      {/* Critical CSS for font loading */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'Montserrat';
              font-style: normal;
              font-weight: 400;
              font-display: swap;
              src: url('https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459WlhyyTh89Y.woff2') format('woff2');
            }
            @font-face {
              font-family: 'Montserrat';
              font-style: normal;
              font-weight: 600;
              font-display: swap;
              src: url('https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459WdhyyTh89Y.woff2') format('woff2');
            }
            @font-face {
              font-family: 'Montserrat';
              font-style: normal;
              font-weight: 700;
              font-display: swap;
              src: url('https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459WZhyyTh89Y.woff2') format('woff2');
            }
          `,
        }}
      />
    </Head>
  );
};

export default RootHeader;
