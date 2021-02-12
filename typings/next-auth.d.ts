declare module "next-auth/jwt" {
  interface Jwt {
    getJwt: (options: {
      req: any;
      secret?: string;
    }) => Promise<{ account: { accessToken: string } }>;
  }

  const jwt: Jwt;

  export default jwt;
}
