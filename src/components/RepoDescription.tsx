import React from "react";

import { Flex, Text, AvatarStack } from "@primer/components";
import { Actor, ExtendedRepo } from "../utils/types";
import { RepoLink } from "./HomePageLink";
import { renderEmoji } from "../utils/renderEmoji";
import { ActorAvatar } from "./ActorAvatar";
import { Language } from "./Language";
import { StarCount } from "./StarCount";

export const RepoDescription = ({
  repo,
  users = [],
  ...props
}: {
  repo: ExtendedRepo;
  users?: Actor[];
} & React.ComponentProps<typeof Flex>) => {
  const hasRepoInfo =
    repo.languages?.edges[0] || repo.stargazers || users.length > 0;

  return (
    <Flex flexDirection="column" {...props}>
      <RepoLink repo={repo} mb={1} />

      {repo.description && (
        <Text mb={2} color="gray.7">
          {renderEmoji(repo.description)}
        </Text>
      )}

      {hasRepoInfo && (
        <Flex alignItems="center" justifyContent="space-between">
          <Flex>
            {repo.languages?.edges[0] && (
              <Language language={repo.languages.edges[0]} mr={4} />
            )}
            {repo.stargazers && (
              <StarCount
                stargazers={repo.stargazers.totalCount}
                repo={repo.url}
              />
            )}
          </Flex>

          {users.length > 0 && (
            <AvatarStack alignRight>
              {users.map((user) => (
                <ActorAvatar key={user.id} showTooltip actor={user} size={20} />
              ))}
            </AvatarStack>
          )}
        </Flex>
      )}
    </Flex>
  );
};
