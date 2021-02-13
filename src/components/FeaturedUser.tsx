/* eslint-disable react/no-danger */

import * as React from "react";
import {
  Avatar,
  Box,
  Flex,
  Text,
  Link,
  Grid,
  BorderBox,
  LabelGroup,
  Label,
} from "@primer/components";
import { GitMergeIcon, RepoIcon } from "@primer/styled-octicons";

import {
  TrendingUserProfileInfo,
  TrendingUserFollowerInfo,
} from "./TrendingUser";
import { Card } from "./Card";
import { FeaturedTrendingUser } from "../utils/types";
import { renderEmoji } from "../utils/renderEmoji";
import { Language } from "./Language";
import { StarCount } from "./StarCount";
import PopperPopover from "./Popover";

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
        <Flex alignItems="center" mb={6}>
          <Avatar
            size={180}
            sx={{ borderRadius: "100%" }}
            alt={`${props.name || props.login} Profile`}
            src={props.avatar_url}
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

            <div>
              <TrendingUserProfileInfo {...props} />
            </div>
            <TrendingUserFollowerInfo {...props} />
          </Flex>
        </Flex>

        <Text as="h3" fontSize={20} fontWeight="bold" mb={3}>
          Recent Pull Requests
        </Text>

        <Grid gridTemplateColumns="max-content auto auto" mb={6}>
          {props.recentContributions.map((contribution) => {
            const trigger = (
              <Link
                muted
                target="blank"
                rel="noreferrer"
                href={contribution.url}
              >
                <Text color="gray.9" mr={4}>
                  {contribution.title}
                </Text>
              </Link>
            );

            return (
              <React.Fragment key={contribution.url}>
                <Link
                  muted
                  target="blank"
                  rel="noreferrer"
                  href={contribution.url}
                >
                  <Flex alignItems="center">
                    <Flex
                      color={
                        (contribution.state === "MERGED" && "purple.5") ||
                        (contribution.state === "CLOSED" && "red.5") ||
                        "green.5"
                      }
                      alignItems="center"
                      justifyContent="center"
                      mr={2}
                    >
                      <GitMergeIcon />
                    </Flex>
                    <Text color="black" mr={4} fontWeight="bold">
                      #{contribution.number}
                    </Text>
                  </Flex>
                </Link>
                {contribution.bodyHTML ||
                contribution.labels.nodes.length !== 0 ? (
                  <PopperPopover maxWidth={600} trigger={trigger}>
                    {contribution.labels.nodes.length !== 0 && (
                      <Flex
                        alignItems="center"
                        justifyContent="space-between"
                        mb={contribution.bodyHTML ? 4 : undefined}
                      >
                        <LabelGroup>
                          {contribution.labels.nodes.map((label) => (
                            <Label key={label.name} color={label.color}>
                              {label.name}
                            </Label>
                          ))}
                        </LabelGroup>
                      </Flex>
                    )}
                    <div
                      className="markdown-body"
                      dangerouslySetInnerHTML={{
                        __html: contribution.bodyHTML,
                      }}
                    />
                  </PopperPopover>
                ) : (
                  trigger
                )}
                <Box sx={{ textAlign: "right" }}>
                  <Link
                    muted
                    target="blank"
                    rel="noreferrer"
                    href={contribution.repository.url}
                  >
                    {contribution.repository.nameWithOwner}
                  </Link>
                </Box>
              </React.Fragment>
            );
          })}
        </Grid>

        {props.pinnedItems && props.pinnedItems.length !== 0 && (
          <>
            <Text as="h3" fontSize={20} fontWeight="bold" mb={3}>
              Pinned
            </Text>

            <Grid gridTemplateColumns="1fr 1fr" gridGap={3}>
              {props.pinnedItems.map((pinned) => (
                <BorderBox key={pinned.url} p={3} height="100%">
                  <Flex
                    flexDirection="column"
                    justifyContent="space-between"
                    height="100%"
                  >
                    <div>
                      <Flex alignItems="center" mb={2}>
                        <Flex
                          alignItems="center"
                          justifyContent="center"
                          mr={1}
                          color="gray."
                          pt="2px"
                        >
                          <RepoIcon />
                        </Flex>
                        <Link href={pinned.url} target="blank" rel="noreferrer">
                          <Text fontWeight="bold">{pinned.name}</Text>
                        </Link>
                      </Flex>

                      {pinned.description && (
                        <Text as="p" color="gray.7" m={0}>
                          {renderEmoji(pinned.description)}
                        </Text>
                      )}
                    </div>

                    <Flex mt={3}>
                      {"languages" in pinned && pinned.languages.edges[0] && (
                        <Language language={pinned.languages.edges[0]} mr={3} />
                      )}
                      {pinned.stargazerCount && (
                        <StarCount
                          stargazers={pinned.stargazerCount}
                          repo={pinned.url}
                        />
                      )}
                    </Flex>
                  </Flex>
                </BorderBox>
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Card>
  );
};
