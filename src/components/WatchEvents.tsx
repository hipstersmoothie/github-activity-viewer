import React from "react";

import { BorderBox, SelectMenu, Button, Relative } from "@primer/components";
import { GitHubFeedEvent, Repo, Actor, LanguageType } from "../utils/types";
import { DEFAULT_LANGUAGE_COLOR } from "../utils/constants";
import { DataContext } from "../contexts/data";
import { queryId } from "../utils/queryId";
import { Events } from "./Event";
import { Language } from "./Language";
import { RepoDescription } from "./RepoDescription";

const ALL_LANGUAGE = {
  node: { color: DEFAULT_LANGUAGE_COLOR, name: "All" },
};

const LanguageFilter = ({
  languages,
  languageFilter,
  languageFilterSet,
}: {
  languages: LanguageType[];
  languageFilter: LanguageType;
  languageFilterSet: (newLang: LanguageType) => void;
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
              <SelectMenu.Item
                as="button"
                onClick={() => languageFilterSet(null)}
              >
                <Language language={ALL_LANGUAGE} />
              </SelectMenu.Item>
            )}
            {sortedLanguages.map((language) => (
              <SelectMenu.Item
                as="button"
                key={language.node.name}
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

export const WatchEvents = ({
  events,
  ...props
}: { events: GitHubFeedEvent[] } & Omit<
  React.ComponentProps<typeof BorderBox>,
  "title"
>) => {
  const { repoInfo } = React.useContext(DataContext);
  const [
    languageFilter,
    languageFilterSet,
  ] = React.useState<LanguageType | null>(null);
  const groupedByProject = new Map<string, Actor[]>();
  const projects: Repo[] = [];
  const languages: LanguageType[] = [];

  events.forEach((event) => {
    if (groupedByProject.has(event.repo.name)) {
      if (
        !groupedByProject
          .get(event.repo.name)
          .find((p) => p.login === event.actor.login)
      ) {
        groupedByProject.get(event.repo.name).push(event.actor);
      }
    } else {
      projects.push(event.repo);
      groupedByProject.set(event.repo.name, [event.actor]);

      const info = repoInfo[queryId(event.repo)];

      if (
        info.languages.edges.length &&
        !languages.find(
          (l) => l.node.name === info.languages.edges[0].node.name
        )
      ) {
        languages.push(info.languages.edges[0]);
      }
    }
  });

  const sortedProjects = projects.sort(
    (a, b) =>
      groupedByProject.get(b.name).length - groupedByProject.get(a.name).length
  );

  return (
    <Events
      {...props}
      title="Recently Starred"
      showCount={4}
      events={sortedProjects}
      filterComponent={
        <LanguageFilter
          languages={languages}
          languageFilter={languageFilter}
          languageFilterSet={languageFilterSet}
        />
      }
      shownFilter={(repo: Repo) => {
        const info = repoInfo[queryId(repo)];

        if (!languageFilter) {
          return true;
        }

        return (
          info.languages.edges.length &&
          info.languages.edges[0].node.name === languageFilter.node.name
        );
      }}
      eventComponent={(p) => {
        const users = groupedByProject.get(p.event.name);
        return (
          <RepoDescription
            repo={{ ...p.event, ...repoInfo[queryId(p.event)] }}
            users={users}
            mb={4}
          />
        );
      }}
    />
  );
};
