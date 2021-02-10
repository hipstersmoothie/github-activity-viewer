import React from "react";
import { Avatar, Box, Flex, Text, Link } from "@primer/components";

import {
  TrendingUserProfileInfo,
  TrendingUserFollowerInfo,
} from "./TrendingUser";
import { Card } from "./Card";
import { FeaturedTrendingUser } from "../utils/types";

export const FeaturedUser = (props: FeaturedTrendingUser) => {
  const featuredUserProfileLink = (
    <Link
      muted
      target="_blank"
      rel="noreferrer"
      href={`https://github.com/${props.login}`}
    >
      @{props.login}
    </Link>
  );

  return (
    <Card title="Featured User" width="100%">
      <Box pr={4}>
        <Flex alignItems="center">
          <Avatar
            size={180}
            sx={{ borderRadius: "100%" }}
            alt={`${props.name || props.login} Profile`}
            src={props.avatarUrl}
            mr={5}
          />
          <Flex flex={1} flexDirection="column">
            {props.name ? (
              <Flex
                as="p"
                mb={3}
                mt={0}
                alignItems="center"
                justifyContent="space-between"
                flex={1}
              >
                <Text as="span" fontWeight="bold" fontSize={24} mr={2}>
                  {props.name}
                </Text>
                <Text as="span" color="gray.6" fontSize={16}>
                  {featuredUserProfileLink}
                </Text>
              </Flex>
            ) : (
              <Text as="p" fontWeight="bold" mb={3} mt={0}>
                {featuredUserProfileLink}
              </Text>
            )}

            {props.bioHTML && (
              <Text
                as="p"
                dangerouslySetInnerHTML={{ __html: props.bioHTML }}
              />
            )}

            <TrendingUserProfileInfo {...props} />
            <TrendingUserFollowerInfo {...props} />
          </Flex>
        </Flex>
      </Box>
    </Card>
  );
};
