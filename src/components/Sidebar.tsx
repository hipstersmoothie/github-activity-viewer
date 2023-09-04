/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Suspense } from "react";
import Link from "next/link";
import {
  ZapIcon,
  PersonIcon,
  PeopleIcon,
  SignOutIcon,
} from "@primer/octicons-react";
import { Box, BoxProps, Tooltip } from "@primer/react";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

import { FullPageSpinner } from "./Spinner";

const SideBarItem = ({
  active,
  children,
  href,
  label,
  ...props
}: BoxProps & {
  active?: boolean;
  href: string;
  label: string;
}) => {
  return (
    <Tooltip direction="e" aria-label={label} sx={{ width: "100%" }}>
      <Link href={href} style={{ width: "100%" }}>
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
      </Link>
    </Tooltip>
  );
};

export type SidebarActive = "/" | "/user" | "/discover";

export const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

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
            <SideBarItem label="Feed" href="/" active={router.route === "/"}>
              <ZapIcon />
            </SideBarItem>
            <SideBarItem
              label="User Events"
              href="/user"
              active={router.route === "/user"}
            >
              <PersonIcon />
            </SideBarItem>
            <SideBarItem
              label="Discover Followers"
              href="/discover"
              active={router.route === "/discover"}
            >
              <PeopleIcon />
            </SideBarItem>
          </Box>
          <SideBarItem
            label="Signout"
            href="/sign-in"
            onClick={() => supabaseClient.auth.signOut()}
          >
            <SignOutIcon />
          </SideBarItem>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" sx={{ flex: 1 }}>
        <Suspense fallback={<FullPageSpinner />}>{children}</Suspense>
      </Box>
    </Box>
  );
};
