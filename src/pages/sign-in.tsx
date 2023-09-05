import { Box, Button } from "@primer/react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const SignIn = () => {
  const supabase = createClientComponentClient();

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: "http://localhost:3000/api/auth/callback",
        scopes: "user",
      },
    });
  };

  return (
    <Box
      display="flex"
      height="100vh"
      width="100vw"
      alignItems="center"
      justifyContent="center"
    >
      <Button onClick={handleSignIn}>Sign In</Button>
    </Box>
  );
};

export default SignIn;
