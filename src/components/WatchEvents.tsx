import * as React from "react";

import {
  Box,
  Text,
  SelectMenu,
  Button,
  Relative,
  Flex,
  Heading,
  BorderBox,
} from "@primer/components";

import { CardDivider } from "./Card";
import { GitHubFeedEvent, Repo, User, LanguageType } from "../utils/types";
import { DEFAULT_LANGUAGE_COLOR } from "../utils/constants";
import { DataContext } from "../contexts/data";
import { queryId } from "../utils/queryId";
import { Language } from "./Language";
import { RepoDescription } from "./RepoDescription";
import { useWindowFocus } from "../hooks/useWindowFocus";
import { GridCard } from "./Event";

const ALL_LANGUAGE = {
  node: { color: DEFAULT_LANGUAGE_COLOR, name: "All" },
};
const ROW_HEIGHT = 108;

const LanguageFilter = ({
  languages,
  languageFilter,
  languageFilterSet,
}: {
  languages: LanguageType[];
  languageFilter?: LanguageType;
  languageFilterSet: (newLang?: LanguageType) => void;
}) => {
  const [search, searchSet] = React.useState("");
  const sortedLanguages = languages
    .sort((a, b) => a.node.name.localeCompare(b.node.name))
    .filter((lang) => !search || lang.node.name.toLowerCase().includes(search));

  return (
    <Relative display="flex" justifyContent="flex-end">
      <SelectMenu>
        <Button as="summary">
          <Language language={languageFilter || ALL_LANGUAGE} />
        </Button>
        <SelectMenu.Modal align="right">
          <SelectMenu.Header>Languages</SelectMenu.Header>

          <SelectMenu.Filter
            placeholder="Filter languages"
            aria-label="Filter Languages"
            value={search}
            onChange={(e) => searchSet(e.target.value.toLowerCase())}
          />

          <SelectMenu.List>
            {!search && (
              <SelectMenu.Item as="button" onClick={() => languageFilterSet()}>
                <Language language={ALL_LANGUAGE} />
              </SelectMenu.Item>
            )}
            {sortedLanguages.map((language) => (
              <SelectMenu.Item
                key={language.node.name}
                as="button"
                onClick={() => languageFilterSet(language)}
              >
                <Language language={language} />
              </SelectMenu.Item>
            ))}
          </SelectMenu.List>
        </SelectMenu.Modal>
      </SelectMenu>
    </Relative>
  );
};

const Section = ({ children }: { children: React.ReactNode }) => (
  <Box
    my={6}
    pb={2}
    sx={{ borderBottom: "1px solid", borderColor: "gray.3" }}
    color="gray.5"
  >
    <Text>{children}</Text>
  </Box>
);

const useUser = () => {
  const { user } = React.useContext(DataContext);
  return user;
};

const isGithubEvent = (
  value: GitHubFeedEvent | Repo
): value is GitHubFeedEvent => "type" in value;

const isRepo = (value: GitHubFeedEvent | Repo): value is Repo =>
  "name" in value;

const useUserRepoEvents = <T extends GitHubFeedEvent | Repo>(events: T[]) => {
  const { login } = useUser() || {};
  const fromUsersRepos: T[] = [];
  const fromOtherRepos: T[] = [];

  events.forEach((event) => {
    if (
      (isGithubEvent(event) && event.repo.name.split("/")[0] === login) ||
      (isRepo(event) && event.name.split("/")[0] === login)
    ) {
      fromUsersRepos.push(event);
    } else {
      fromOtherRepos.push(event);
    }
  });

  return { fromUsersRepos, fromOtherRepos };
};

export const WatchEvents = ({
  events,
  pageHeight,
}: { events: GitHubFeedEvent[]; pageHeight?: number } & Omit<
  React.ComponentProps<typeof BorderBox>,
  "title"
>) => {
  const { repoInfo } = React.useContext(DataContext);
  const [languageFilter, languageFilterSet] = React.useState<LanguageType>();
  const groupedByProject = new Map<string, User[]>();
  const projects: Repo[] = [];
  const languages: LanguageType[] = [];
  const lastSeen = localStorage.getItem("github-activity-last-seen");
  const windowFocus = useWindowFocus();

  events.forEach((event) => {
    if (groupedByProject.has(event.repo.name)) {
      const repo = groupedByProject.get(event.repo.name);

      if (repo && !repo.find((p) => p.login === event.actor.login)) {
        repo.push(event.actor);
      }
    } else {
      projects.push(event.repo);
      groupedByProject.set(event.repo.name, [event.actor]);

      // TypeScript 4.2 features break this rule, info is used
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const info = repoInfo[queryId(event.repo)];
      const language = info?.languages?.edges[0];

      if (
        language &&
        !languages.find((l) => l.node.name === language.node.name)
      ) {
        languages.push(language);
      }
    }
  });

  projects.sort(
    (a, b) =>
      (groupedByProject.get(b.name) || []).length -
      (groupedByProject.get(a.name) || []).length
  );

  const firstWithOneStar =
    projects.find((p) => (groupedByProject.get(p.name) || []).length === 1) ||
    ({} as Repo);

  const storageId = (repo: Repo) => {
    const users = groupedByProject.get(repo.name) || [];
    const logins = users.map((u) => u.login);

    return `${repo.id}-${logins.join("-")}`;
  };

  // Remember the latest repo seen
  React.useEffect(() => {
    const first = projects.find((p) => {
      const users = groupedByProject.get(p.name) || [];
      return users.length === 1;
    });

    if (!first) {
      return;
    }

    if (windowFocus) {
      localStorage.setItem("github-activity-last-seen", storageId(first));
    }
    // Only windowFocus is a dep because we actually want the stale values for all
    // other potential deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowFocus]);

  const { fromOtherRepos, fromUsersRepos } = useUserRepoEvents(projects);

  const RepoRenderer = (repo: Repo) => {
    const users = groupedByProject.get(repo.name) || [];

    return (
      <>
        {users.length > 1 && repo.name === projects[0]?.name && (
          <Section>Trending Among People you Follow</Section>
        )}
        {users.length === 1 &&
          firstWithOneStar.name === repo.name &&
          lastSeen !== storageId(repo) && <Section>Starred</Section>}
        {lastSeen === storageId(repo) && <Section>Seen previously...</Section>}

        <RepoDescription
          repo={{ ...repo, ...repoInfo[queryId(repo)] }}
          users={users}
          mb={4}
        />
      </>
    );
  };

  // TOP TITLE SPACE + CONTAINER PADDING
  const containerHeight = 32 + 68;
  const yourReposHeight = fromUsersRepos.length
    ? // YOUR_REPOS_TITLE + YOUR_REPOS_HEIGHT + DIVIDER
      48 + fromUsersRepos.length * ROW_HEIGHT + 65
    : 0;
  const otherReposTitleHeight = 140;

  return (
    <GridCard
      title="Recently Starred"
      showCount={Math.floor(
        ((pageHeight || 0) -
          containerHeight -
          yourReposHeight -
          otherReposTitleHeight) /
          ROW_HEIGHT
      )}
      staticRows={
        <>
          {fromUsersRepos.length > 0 && (
            <>
              <Heading fontSize={2} mb={4}>
                On Your Repos
              </Heading>

              {fromUsersRepos.map((repo) => (
                <RepoRenderer key={`repo-${repo.id}`} {...repo} />
              ))}

              <CardDivider my={5} />
            </>
          )}

          <Flex alignItems="center" justifyContent="space-between" mb={4}>
            <Heading fontSize={2}>On Other Repos</Heading>
            <LanguageFilter
              languages={languages}
              languageFilter={languageFilter}
              languageFilterSet={languageFilterSet}
            />
          </Flex>
        </>
      }
      rows={fromOtherRepos
        .filter((repo) => {
          if (!languageFilter) {
            return true;
          }

          // TypeScript 4.2 features break this rule, info is used
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const info = repoInfo[queryId(repo)];

          return (
            info?.languages?.edges[0]?.node.name === languageFilter.node.name
          );
        })
        .map((repo) => (
          <RepoRenderer key={repo.id} {...repo} />
        ))}
    />
  );
};
