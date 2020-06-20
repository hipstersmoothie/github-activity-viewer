import { BaseStyles } from "@primer/components";

const MyApp = ({ Component, pageProps }) =>(
  <BaseStyles>
    <Component {...pageProps} />{" "}
  </BaseStyles>
)

export default MyApp;