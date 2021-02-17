/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Suspense } from "react";
import Link from "next/link";
import { ZapIcon, PersonIcon, PeopleIcon, SignOutIcon } from "@primer/octicons-react";
import { Flex, Sticky, theme, Tooltip } from "@primer/components";
import { signOut } from "next-auth/client";

import { FullPageSpinner } from "./Spinner";

const SideBarItem = ({
  active,
  children,
  href,
  label,
  ...props
}: React.ComponentProps<typeof Flex> & {
  active?: boolean;
  href: string;
  label: string;
}) => {
  return (
    <Tooltip direction="e" aria-label={label} sx={{ width: "100%" }}>
      <Link passHref href={href}>
        <a style={{ width: "100%" }}>
          <Flex
            alignItems="center"
            justifyContent="center"
            sx={{
              width: "100%",
              height: 64,
              color: active ? "white" : theme["colors"].gray[9],
              background: active ? theme["colors"].blue[4] : undefined,
              ":hover": {
                color: active ? undefined : "black",
                background: active ? "" : theme["colors"].blue[2],
              },
            }}
            {...props}
          >
            {children}
          </Flex>
        </a>
      </Link>
    </Tooltip>
  );
};

export type SidebarActive = "/" | "/user" | "/discover";

export const SidebarLayout = ({
  children,
  active,
}: {
  children: React.ReactNode;
  active: SidebarActive;
}) => {
  return (
    <Flex
      sx={{
        backgroundColor: "gray.1",
        minHeight: "100vh",
      }}
    >
      <Sticky
        top={0}
        sx={{
          width: 64,
          minHeight: "100vh",
          maxHeight: "100vh",
          background: "white",
          color: "gray.6",
        }}
      >
        <Flex flexDirection="column" justifyContent="space-between" height="100%">
          <Flex alignItems="start" flexDirection="column">
            <SideBarItem label="Feed" href="/" active={active === "/"}>
              <ZapIcon />
            </SideBarItem>
            <SideBarItem
              label="User Events"
              href="/user"
              active={active === "/user"}
            >
              <PersonIcon />
            </SideBarItem>
            <SideBarItem
              label="Discover Followers"
              href="/discover"
              active={active === "/discover"}
            >
              <PeopleIcon />
            </SideBarItem>
          </Flex>
          <SideBarItem
            label="Signout"
            href="/api/auth/signin"
            onClick={() => signOut()}
          >
            <SignOutIcon />
          </SideBarItem>
        </Flex>
      </Sticky>
      <Flex justifyContent="center" sx={{ flex: 1 }}>
        <Suspense fallback={<FullPageSpinner />}>{children}</Suspense>
      </Flex>
    </Flex>
  );
};
