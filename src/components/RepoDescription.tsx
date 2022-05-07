import { Box, BoxProps, Text, AvatarStack } from "@primer/react";
import { User, ExtendedRepo, Repo } from "../utils/types";
import { RepoLink } from "./HomePageLink";
import { renderEmoji } from "../utils/renderEmoji";
import { ActorAvatar } from "./ActorAvatar";
import { Language } from "./Language";
import { StarCount } from "./StarCount";
import { TwitterIcon } from "./TwitterIcon";

export const RepoDescription = ({
  repo,
  users = [],
  ...props
}: {
  repo: ExtendedRepo | Repo;
  users?: User[];
} & BoxProps) => {
  const hasRepoInfo =
    ("languages" in repo && repo.languages.edges[0]) ||
    ("stargazers" in repo && repo.stargazers) ||
    users.length > 0;

  return (
    <Box display="flex" flexDirection="column" {...props}>
      <RepoLink repo={repo} mb={1} />

      {repo.description && (
        <Text mb={2} color="fg.default">
          {renderEmoji(repo.description)}
        </Text>
      )}

      {hasRepoInfo && (
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex">
            {"languages" in repo && repo.languages.edges[0] && (
              <Language language={repo.languages.edges[0]} mr={4} />
            )}
            {"stargazers" in repo && repo.stargazers && (
              <StarCount
                stargazers={repo.stargazers.totalCount}
                repo={repo.url}
                mr={3}
              />
            )}

            <Box
              as="a"
              target="_blank"
              rel="noreferrer"
              href={`https://twitter.com/search?q=${encodeURIComponent(
                repo.url
              )}`}
              sx={{
                height: "20px",
                width: "20px",
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TwitterIcon />
            </Box>
          </Box>

          {users.length > 0 && (
            <AvatarStack alignRight>
              {users.map((user) => (
                <ActorAvatar key={user.id} showTooltip actor={user} size={20} />
              ))}
            </AvatarStack>
          )}
        </Box>
      )}
    </Box>
  );
};
