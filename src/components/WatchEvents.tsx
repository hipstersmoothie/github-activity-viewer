import * as React from "react";

import {
  Box,
  Text,
  ActionMenu,
  ActionList,
  Heading,
  BoxProps,
} from "@primer/react";

import { CardDivider } from "./Card";
import { GitHubFeedEvent, Repo, User, LanguageType } from "../utils/types";
import { DataContext } from "../contexts/data";
import { queryId } from "../utils/queryId";
import { Language } from "./Language";
import { RepoDescription } from "./RepoDescription";
import { useWindowFocus } from "../hooks/useWindowFocus";
import { GridCard } from "./Event";

const ALL_LANGUAGE = {
  node: { color: "fg.default", name: "All" },
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
  const [search] = React.useState("");
  const sortedLanguages = languages
    .sort((a, b) => a.node.name.localeCompare(b.node.name))
    .filter((lang) => !search || lang.node.name.toLowerCase().includes(search));

  return (
    <Box position="relative" display="flex" justifyContent="flex-end">
      <ActionMenu>
        <ActionMenu.Button as="summary">
          <Language language={languageFilter || ALL_LANGUAGE} />
        </ActionMenu.Button>
        <ActionMenu.Overlay sx={{ zIndex: 10000 }}>
          {/* <ActionMenu.Filter
            placeholder="Filter languages"
            aria-label="Filter Languages"
            value={search}
            onChange={(e) => searchSet(e.target.value.toLowerCase())}
          /> */}

          <ActionList>
            <ActionList.Group title="Languages">
              {!search && (
                <ActionList.Item onClick={() => languageFilterSet()}>
                  <Language language={ALL_LANGUAGE} />
                </ActionList.Item>
              )}
              {sortedLanguages.map((language) => (
                <ActionList.Item
                  key={language.node.name}
                  onClick={() => languageFilterSet(language)}
                >
                  <Language language={language} />
                </ActionList.Item>
              ))}
            </ActionList.Group>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </Box>
  );
};

const Section = ({ children }: { children: React.ReactNode }) => (
  <Box
    my={6}
    pb={2}
    sx={{ borderBottom: "1px solid", borderColor: "border.muted" }}
    color="fg.subtle"
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
  BoxProps,
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
    const info = repoInfo[queryId(repo)];

    if (!info) {
      return null;
    }

    return (
      <>
        {users.length > 1 && repo.name === projects[0]?.name && (
          <Section>Trending Among People you Follow</Section>
        )}
        {users.length === 1 &&
          firstWithOneStar.name === repo.name &&
          lastSeen !== storageId(repo) && <Section>Starred</Section>}
        {lastSeen === storageId(repo) && <Section>Seen previously...</Section>}

        <RepoDescription repo={{ ...repo, ...info }} users={users} mb={4} />
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
              <Heading sx={{ fontSize: 2, mb: 4, color: "fg.muted" }}>
                On Your Repos
              </Heading>

              {fromUsersRepos.map((repo) => (
                <RepoRenderer key={`repo-${repo.id}`} {...repo} />
              ))}

              <CardDivider my={5} />
            </>
          )}

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={4}
          >
            <Heading sx={{ fontSize: 2, color: "fg.muted" }}>
              On Other Repos
            </Heading>
            <LanguageFilter
              languages={languages}
              languageFilter={languageFilter}
              languageFilterSet={languageFilterSet}
            />
          </Box>
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
