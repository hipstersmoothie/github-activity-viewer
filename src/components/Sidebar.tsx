import React, { Suspense } from "react";
import Link from "next/link";
import {
  ZapIcon,
  PersonIcon,
  PeopleIcon,
  SignOutIcon,
  SunIcon,
  MoonIcon,
} from "@primer/octicons-react";
import { Box, BoxProps, Tooltip } from "@primer/react";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useCookies } from "react-cookie";

import { FullPageSpinner } from "./Spinner";

const SideBarItem = ({
  active,
  children,
  ...props
}: BoxProps & {
  active?: boolean;
}) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={active ? "accent.emphasis" : undefined}
      color={active ? "fg.onEmphasis" : "fg.muted"}
      sx={{
        width: "100%",
        height: 64,
        ":hover": {
          color: active ? undefined : "fg.default",
          bg: active ? "" : "accent.muted",
        },
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export type SidebarActive = "/" | "/user" | "/discover";

export const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const [{ colorMode }, setCookie] = useCookies(["colorMode"]);

  return (
    <Box
      display="flex"
      sx={{
        bg: "canvas.inset",
        minHeight: "100vh",
      }}
    >
      <Box
        top={0}
        position="sticky"
        sx={{
          width: 64,
          minHeight: "100vh",
          maxHeight: "100vh",
          bg: "canvas.default",
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          height="100%"
        >
          <Box display="flex" alignItems="start" flexDirection="column">
            <Tooltip direction="e" aria-label="Feed" sx={{ width: "100%" }}>
              <Link href="/" style={{ width: "100%" }}>
                <SideBarItem active={router.route === "/"}>
                  <ZapIcon />
                </SideBarItem>
              </Link>
            </Tooltip>
            <Tooltip
              direction="e"
              aria-label="User Events"
              sx={{ width: "100%" }}
            >
              <Link href="/user" style={{ width: "100%" }}>
                <SideBarItem active={router.route === "/user"}>
                  <PersonIcon />
                </SideBarItem>
              </Link>
            </Tooltip>
            <Tooltip
              direction="e"
              aria-label="Discover Followers"
              sx={{ width: "100%" }}
            >
              <Link href="/discover" style={{ width: "100%" }}>
                <SideBarItem active={router.route === "/discover"}>
                  <PeopleIcon />
                </SideBarItem>
              </Link>
            </Tooltip>
          </Box>
          <div>
            {colorMode === "night" ? (
              <SideBarItem onClick={() => setCookie("colorMode", "day")}>
                <SunIcon />
              </SideBarItem>
            ) : (
              <SideBarItem onClick={() => setCookie("colorMode", "night")}>
                <MoonIcon />
              </SideBarItem>
            )}
            <Tooltip direction="e" aria-label="Sign out" sx={{ width: "100%" }}>
              <Link href="/sign-in" style={{ width: "100%" }}>
                <SideBarItem onClick={() => supabaseClient.auth.signOut()}>
                  <SignOutIcon />
                </SideBarItem>
              </Link>
            </Tooltip>
          </div>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" sx={{ flex: 1 }}>
        <Suspense fallback={<FullPageSpinner />}>{children}</Suspense>
      </Box>
    </Box>
  );
};
