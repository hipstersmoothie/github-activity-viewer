import nextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

export default nextAuth({
  providers: [
    // eslint-disable-next-line new-cap
    GithubProvider({
      clientId: process.env["GITHUB_ID"],
      clientSecret: process.env["GITHUB_SECRET"],
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        // eslint-disable-next-line no-param-reassign
        token.accessToken = account.access_token;
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      // eslint-disable-next-line no-param-reassign
      session.accessToken = token.accessToken;
      return session;
    },
  },
});
