import * as React from "react";
import {
  AvatarStack,
  Text,
  CounterLabel,
  Link,
  Box,
  BoxProps,
} from "@primer/react";
import {
  LinkIcon,
  LocationIcon,
  OrganizationIcon,
  PeopleIcon,
} from "@primer/styled-octicons";

import { ActorAvatar } from "./ActorAvatar";
import { ActorLink } from "./HomePageLink";
import PopperPopover, { PopperPopoverProps } from "./Popover";
import { TrendingActor } from "../utils/types";

const DataIcon = ({
  icon,
  children,
  ...props
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
} & BoxProps) => {
  return (
    <Box display="flex" alignItems="center" {...props}>
      <Box display="flex" mr={2} justifyContent="center" alignItems="center">
        {icon}
      </Box>
      <Text as="p" color="fg.muted" fontSize={14} m={0}>
        {children}
      </Text>
    </Box>
  );
};

const TrendingUserName = (props: Pick<TrendingActor, "name" | "login">) => {
  if (props.name) {
    return (
      <Box display="flex" as="p" my={0} alignItems="center">
        <Text as="span" fontWeight="bold" mr={1}>
          {props.name}
        </Text>
        <Text as="span" color="fg.muted" fontSize={14}>
          {props.login}
        </Text>
      </Box>
    );
  }

  return (
    <Text as="p" fontWeight="bold" my={0}>
      {props.login}
    </Text>
  );
};

export const TrendingUserProfileInfo = (
  props: Partial<
    Pick<
      TrendingActor,
      "company" | "location" | "twitterUsername" | "websiteUrl"
    >
  >
) => {
  return (
    <>
      {props.company && (
        <DataIcon
          mt={3}
          mb={1}
          icon={<OrganizationIcon color="fg.subtle" size={16} />}
        >
          {props.company.startsWith("@") ? (
            <Link
              target="_blank"
              rel="noopener"
              href={`https://github.com/${props.company.replace("@", "")}`}
              sx={{
                color: "fg.muted",
                ":hover": {
                  color: "blue.5",
                  textDecoration: "none",
                },
              }}
            >
              {props.company}
            </Link>
          ) : (
            props.company
          )}
        </DataIcon>
      )}

      {props.location && (
        <DataIcon
          mt={props.company ? 2 : 3}
          mb={1}
          icon={<LocationIcon color="fg.subtle" size={16} />}
        >
          {props.location}
        </DataIcon>
      )}

      {props.websiteUrl && (
        <DataIcon
          mt={props.company || props.location ? 2 : 3}
          mb={1}
          icon={<LinkIcon color="fg.subtle" size={16} />}
        >
          <Link
            target="_blank"
            rel="noopener"
            href={props.websiteUrl}
            sx={{
              color: "fg.muted",
              ":hover": {
                color: "blue.5",
                textDecoration: "none",
              },
            }}
          >
            {props.websiteUrl}
          </Link>
        </DataIcon>
      )}

      {props.twitterUsername && (
        <DataIcon
          mt={props.company || props.location || props.websiteUrl ? 2 : 3}
          mb={1}
          icon={
            <Box
              as="svg"
              sx={{ fill: "fg.subtle" }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 273.5 222.3"
              height={16}
              width={16}
            >
              <path
                d="M273.5 26.3a109.77 109.77 0 0 1-32.2 8.8 56.07 56.07 0 0 0 24.7-31 113.39 113.39 0 0 1-35.7 13.6 56.1 56.1 0 0 0-97 38.4 54 54 0 0 0 1.5 12.8A159.68 159.68 0 0 1 19.1 10.3a56.12 56.12 0 0 0 17.4 74.9 56.06 56.06 0 0 1-25.4-7v.7a56.11 56.11 0 0 0 45 55 55.65 55.65 0 0 1-14.8 2 62.39 62.39 0 0 1-10.6-1 56.24 56.24 0 0 0 52.4 39 112.87 112.87 0 0 1-69.7 24 119 119 0 0 1-13.4-.8 158.83 158.83 0 0 0 86 25.2c103.2 0 159.6-85.5 159.6-159.6 0-2.4-.1-4.9-.2-7.3a114.25 114.25 0 0 0 28.1-29.1"
                fill="currentColor"
              />
            </Box>
          }
        >
          <Link
            target="_blank"
            rel="noreferrer"
            href={`https://twitter.com/${props.twitterUsername}`}
            sx={{
              color: "fg.muted",
              ":hover": {
                color: "blue.5",
                textDecoration: "none",
              },
            }}
          >
            {props.twitterUsername}
          </Link>
        </DataIcon>
      )}
    </>
  );
};

export const TrendingUserFollowerInfo = (
  props: Pick<TrendingActor, "followers" | "newFollowers" | "login">
) => {
  return (
    <Box
      display="flex"
      mt={4}
      justifyContent="space-between"
      alignItems="center"
    >
      <Link
        target="_blank"
        rel="noreferrer"
        href={`https://github.com/${props.login}?tab=followers`}
        sx={{
          color: "fg.muted",
          ":hover": {
            color: "blue.5",
            textDecoration: "none",
          },
          ":hover *": {
            color: "blue.5",
          },
        }}
      >
        <DataIcon icon={<PeopleIcon size={18} />}>
          <Text as="span" fontWeight="bolder">
            {props.followers.totalCount}
          </Text>
          <Text as="span"> Followers</Text>
        </DataIcon>
      </Link>

      <AvatarStack alignRight sx={{ zIndex: 0 }}>
        {props.newFollowers.map((user) => (
          <ActorAvatar key={user.id} showTooltip actor={user} size={20} />
        ))}
      </AvatarStack>
    </Box>
  );
};

type OptionalUserData =
  | "websiteUrl"
  | "twitterUsername"
  | "status"
  | "bioHTML"
  | "company"
  | "location"
  | "isAuthenticatedUserFollowing"
  | "newFollowers"
  | "followers"
  | "weight";

export const TrendingUser = (
  trendingUser: Partial<Pick<TrendingActor, OptionalUserData>> &
    Omit<TrendingActor, OptionalUserData> &
    Pick<PopperPopoverProps, "placement"> & {
      id?: string | number;
    }
) => {
  return (
    <Box
      display="flex"
      alignItems="baseline"
      justifyContent="space-between"
      mb={3}
    >
      <PopperPopover
        interactive
        placement={trendingUser.placement}
        trigger={
          <Box display="flex" alignItems="center">
            <ActorAvatar actor={trendingUser} sx={{ mr: 3 }} />
            <ActorLink {...trendingUser} />
          </Box>
        }
      >
        {trendingUser.status && trendingUser.status.message && (
          <Box
            display="flex"
            alignItems="center"
            px={4}
            py={3}
            m={-4}
            mb={4}
            sx={{ borderBottom: "1px solid border.subtle" }}
          >
            <Box
              mr={3}
              dangerouslySetInnerHTML={{
                __html: trendingUser.status.emojiHTML,
              }}
            />
            <Text>{trendingUser.status.message}</Text>
          </Box>
        )}

        <TrendingUserName {...trendingUser} />

        {trendingUser.bioHTML && (
          <Text
            as="p"
            dangerouslySetInnerHTML={{ __html: trendingUser.bioHTML }}
          />
        )}

        <TrendingUserProfileInfo {...trendingUser} />

        {trendingUser.newFollowers && trendingUser.followers && (
          <TrendingUserFollowerInfo
            {...trendingUser}
            newFollowers={trendingUser.newFollowers}
            followers={trendingUser.followers}
          />
        )}
      </PopperPopover>

      {(trendingUser.newFollowers || trendingUser.followers?.totalCount) && (
        <CounterLabel
          sx={{
            color: trendingUser.isAuthenticatedUserFollowing
              ? undefined
              : "accent.fg",
            bg: trendingUser.isAuthenticatedUserFollowing
              ? undefined
              : "accent.subtle",
          }}
        >
          {trendingUser.newFollowers?.length ||
            trendingUser.followers?.totalCount}
        </CounterLabel>
      )}
    </Box>
  );
};
