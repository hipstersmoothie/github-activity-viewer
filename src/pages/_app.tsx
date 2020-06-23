import { BaseStyles } from "@primer/components";
import { Provider } from "next-auth/client";

const MyApp = ({ Component, pageProps }) => {
  const { session } = pageProps;

  return (
    <Provider session={session}>
      <BaseStyles>
        <Component {...pageProps} />
      </BaseStyles>
    </Provider>
  );
};

export default MyApp;
