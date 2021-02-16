import nextAuth from "next-auth";
import Providers from "next-auth/providers";

const options = {
  secret: process.env.GITHUB_SECRET,

  providers: [
    // eslint-disable-next-line new-cap
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],

  callbacks: {
    async jwt(token, user, account) {
      // Add access_token to the token right after signin
      if (account?.accessToken) {
        // eslint-disable-next-line no-param-reassign
        token.accessToken = account.accessToken;
      }

      return token;
    },
  },
};

export default (req, res) => {
  return nextAuth(req, res, options);
};
