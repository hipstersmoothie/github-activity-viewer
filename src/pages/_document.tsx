import { Html, Head, Main, NextScript } from "next/document";

const Document = () => {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon-dark.png" />
        <link
          rel="stylesheet"
          href="https://www.unpkg.com/github-syntax-light@0.5.0/lib/github-light.css"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
