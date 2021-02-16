import NextAuth from "next-auth";
import Providers from "next-auth/providers";

console.log('SITE env var: ', process.env.SITE)

const options = {
  site: process.env.SITE || "http://localhost:3000",

  secret: process.env.GITHUB_SECRET,

  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],

  callbacks: {
    async jwt(token, user, account, profile, isNewUser) {
      // Add access_token to the token right after signin
      if (account?.accessToken) {
        token.accessToken = account.accessToken;
      }

      return token;
    },
  },
};

export default (req, res) => NextAuth(req, res, options);
