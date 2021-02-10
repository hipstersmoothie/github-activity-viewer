/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import Link from "next/link";
import { ZapIcon, PersonIcon } from "@primer/octicons-react";
import { Flex, Sticky, theme } from "@primer/components";

const SideBarItem = ({
  active,
  children,
  href,
  ...props
}: React.ComponentProps<typeof Flex> & { active?: boolean; href: string }) => {
  return (
    <Link passHref href={href}>
      <a style={{width: '100%'}}>
        <Flex
          alignItems="center"
          justifyContent="center"
          sx={{
            width: "100%",
            height: 64,
            color: active ? "white" : theme.colors.gray[9],
            background: active ? theme.colors.blue[4] : undefined,
            ":hover": {
              color: !active && "black",
              background: !active && theme.colors.blue[2],
            },
          }}
          {...props}
        >
          {children}
        </Flex>
      </a>
    </Link>
  );
};

export const SidebarLayout = ({
  children,
  active,
}: {
  children: React.ReactNode;
  active: "following" | "user";
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
        <Flex alignItems="start" flexDirection="column">
          <SideBarItem href="/" active={active === "following"}>
            <ZapIcon />
          </SideBarItem>
          <SideBarItem href="/user" active={active === "user"}>
            <PersonIcon />
          </SideBarItem>
        </Flex>
      </Sticky>
      <Flex justifyContent="center" sx={{ flex: 1 }}>
        {children}
      </Flex>
    </Flex>
  );
};
