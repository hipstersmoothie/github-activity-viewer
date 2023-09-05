/* eslint-disable react/no-danger */

import * as React from "react";
import { Avatar, Box, Text, Link, LabelGroup, Label } from "@primer/react";
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
import { FollowButton } from "./FollowButton";

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

  const [isFollowing, isFollowingSet] = React.useState(
    props.isAuthenticatedUserFollowing
  );

  return (
    <Card
      title={
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          color="fg.default"
        >
          <Text mr={2} style={{ flex: 1 }}>
            Featured User
          </Text>
          <FollowButton
            username={props.login}
            size="small"
            isFollowing={isFollowing}
            onFollowChange={isFollowingSet}
          />
        </Box>
      }
      width="100%"
    >
      <Box pr={4}>
        <Box display="flex" alignItems="center" mb={6}>
          <Avatar
            size={180}
            sx={{ borderRadius: "100%", mr: 5 }}
            alt={`${props.name || props.login} Profile`}
            src={props.avatar_url}
          />
          <Box flex={1}>
            {props.name ? (
              <Box
                as="p"
                display="flex"
                mb={3}
                mt={0}
                alignItems="center"
                justifyContent="space-between"
                flex={1}
              >
                <Text
                  color="fg.default"
                  as="span"
                  fontWeight="bold"
                  fontSize={24}
                  mr={2}
                >
                  {props.name}
                </Text>
                <Text as="span" color="fg.muted" fontSize={16}>
                  {featuredUserProfileLink}
                </Text>
              </Box>
            ) : (
              <Text as="p" fontWeight="bold" color="fg.default" mb={3} mt={0}>
                {featuredUserProfileLink}
              </Text>
            )}

            {props.bioHTML && (
              <Text
                as="p"
                color="fg.default"
                dangerouslySetInnerHTML={{ __html: props.bioHTML }}
              />
            )}

            <div>
              <TrendingUserProfileInfo {...props} />
            </div>
            <TrendingUserFollowerInfo {...props} />
          </Box>
        </Box>

        <Text as="h3" fontSize={20} fontWeight="bold" mb={3} color="fg.muted">
          Recent Pull Requests
        </Text>

        <Box display="grid" gridTemplateColumns="max-content auto auto" mb={6}>
          {props.recentContributions.map((contribution) => {
            const trigger = (
              <Link
                muted
                target="blank"
                rel="noreferrer"
                href={contribution.url}
              >
                <Text color="fg.default" mr={4}>
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
                  <Box display="flex" alignItems="center">
                    <Box
                      display="flex"
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
                    </Box>
                    <Text color="fg.default" mr={4} fontWeight="bold">
                      #{contribution.number}
                    </Text>
                  </Box>
                </Link>
                {contribution.bodyHTML ||
                contribution.labels.nodes.length !== 0 ? (
                  <PopperPopover maxWidth={600} trigger={trigger}>
                    {contribution.labels.nodes.length !== 0 && (
                      <Box
                        display="flex"
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
                      </Box>
                    )}
                    <div
                      dangerouslySetInnerHTML={{
                        __html: contribution.bodyHTML,
                      }}
                      className="markdown-body"
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
        </Box>

        {props.pinnedItems && props.pinnedItems.length !== 0 && (
          <>
            <Text
              as="h3"
              fontSize={20}
              fontWeight="bold"
              mb={3}
              color="fg.muted"
            >
              Pinned
            </Text>

            <Box display="grid" gridTemplateColumns="1fr 1fr" gridGap={3}>
              {props.pinnedItems.map((pinned) => (
                <Box
                  key={pinned.url}
                  borderWidth="1px"
                  borderStyle="solid"
                  borderColor="border.muted"
                  borderRadius={4}
                  p={3}
                  height="100%"
                >
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    height="100%"
                  >
                    <div>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          mr={1}
                          color="fg.default"
                          pt="2px"
                        >
                          <RepoIcon />
                        </Box>
                        <Link href={pinned.url} target="blank" rel="noreferrer">
                          <Text fontWeight="bold">{pinned.name}</Text>
                        </Link>
                      </Box>

                      {pinned.description && (
                        <Text as="p" color="fg.muted" m={0}>
                          {renderEmoji(pinned.description)}
                        </Text>
                      )}
                    </div>

                    <Box display="flex" mt={3}>
                      {"languages" in pinned && pinned.languages.edges[0] && (
                        <Language language={pinned.languages.edges[0]} mr={3} />
                      )}
                      {pinned.stargazerCount && (
                        <StarCount
                          stargazers={pinned.stargazerCount}
                          repo={pinned.url}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Card>
  );
};
