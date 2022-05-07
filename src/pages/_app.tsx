import type { AppProps } from "next/app";
import { ThemeProvider, BaseStyles } from "@primer/react";
import { SessionProvider } from "next-auth/react";

import "../css/main.css";
// eslint-disable-next-line import/no-unassigned-import
import "../css/main.scss";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ThemeProvider colorMode="auto">
      <SessionProvider session={pageProps.session}>
        <Component {...pageProps} />
      </SessionProvider>
    </ThemeProvider>
  );
};

export default MyApp;
