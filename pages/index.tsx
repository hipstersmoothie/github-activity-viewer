import React from "react";
import Head from "next/head";
import ago from "s-ago";
import Markdown from "markdown-to-jsx";
import fetch from "isomorphic-fetch";

import {
  Avatar,
  Link,
  theme,
  Flex,
  BorderBox,
  Heading,
  Box,
  CounterLabel,
  Text,
  AvatarStack,
  Grid,
  SelectMenu,
  Button,
  Popover,
  Relative,
} from "@primer/components";
import { StarIcon } from "@primer/styled-octicons";

import {
  GitHubFeedEvent,
  EventType,
  Repo,
  Actor,
  ForkEventType,
  GetFeedResponse,
  RepoInfoMap,
  ReleaseEventType,
  queryId,
  ExtendedRepo,
  LanguageType,
} from "../src/types";

const DEFAULT_LANGUAGE_COLOR = theme.colors.gray[4];
const ALL_LANGUAGE = { node: { color: DEFAULT_LANGUAGE_COLOR, name: "All" } };

type EventMap = Record<EventType, GitHubFeedEvent[]>;

const DataContext = React.createContext<{
  repoInfo: RepoInfoMap;
}>({
  repoInfo: {},
});

const useFeeds = () => {
  const [feeds, feedsSet] = React.useState<EventMap | undefined>();
  const [repoInfo, repoInfoSet] = React.useState<RepoInfoMap>({});

  React.useEffect(() => {
    fetch("http://localhost:3000/api/get-feed")
      .then((res) => res.json())
      .then((res: GetFeedResponse) => {
        const map: EventMap = {
          ReleaseEvent: [],
          WatchEvent: [],
          PushEvent: [],
          PullRequestEvent: [],
          PullRequestReviewCommentEvent: [],
          CreateEvent: [],
          IssueCommentEvent: [],
          IssuesEvent: [],
          ForkEvent: [],
          DeleteEvent: [],
          PublicEvent: [],
          MemberEvent: [],
        };

        res.events.forEach((event) => {
          map[event.type].push(event);
        });

        repoInfoSet(res.repoInfo);
        feedsSet(map);
      });
  }, []);

  return { feeds, repoInfo };
};

const useUser = () => {
  return "hipstersmoothie";
};

const useRepoInfo = (repo: Repo) => {
  const { repoInfo } = React.useContext(DataContext);
  return { ...repo, ...repoInfo[queryId(repo)] };
};

const isGithubEvent = (
  value: GitHubFeedEvent | Repo
): value is GitHubFeedEvent => "type" in value;

const isRepo = (value: GitHubFeedEvent | Repo): value is Repo =>
  "name" in value;

const useUserRepoEvents = <T extends GitHubFeedEvent | Repo>(events: T[]) => {
  const user = useUser();
  const fromUsersRepos: T[] = [];
  const fromOtherRepos: T[] = [];

  events.forEach((event) => {
    if (
      (isGithubEvent(event) && event.repo.name.split("/")[0] === user) ||
      (isRepo(event) && event.name.split("/")[0] === user)
    ) {
      fromUsersRepos.push(event);
    } else {
      fromOtherRepos.push(event);
    }
  });

  return { fromUsersRepos, fromOtherRepos };
};

interface ActorAvatarProps
  extends Omit<React.ComponentProps<typeof Link>, "href"> {
  size?: number;
  actor: Actor;
}

const ActorAvatar = ({
  actor,
  size = 32,
  style,
  ...linkProps
}: ActorAvatarProps) => (
  <Link
    {...linkProps}
    title={actor.display_login}
    href={`https://github.com/${actor.display_login}`}
    style={{ ...style, borderRadius: "50%", overflow: "hidden", flex: "none" }}
  >
    <Avatar
      src={actor.avatar_url}
      alt={`@${actor.display_login}`}
      size={size}
    />
  </Link>
);

const HomePageLink = (props: React.ComponentProps<typeof Link>) => (
  <Link
    color={theme.colors.bodytext}
    fontWeight="bold"
    sx={{
      ":hover": {
        textDecoration: "none",
        color: theme.colors.blue[5],
      },
    }}
    {...props}
  />
);

const ActorLink = (props: Actor) => (
  <HomePageLink target="_blank" href={`https://github.com/${props.login}`}>
    {props.login}
  </HomePageLink>
);

interface RepoLinkProps extends React.ComponentProps<typeof Link> {
  repo: Repo;
}

const RepoLink = ({ repo: { full_name, name }, ...props }: RepoLinkProps) => (
  <HomePageLink
    {...props}
    target="_blank"
    href={`https://github.com/${full_name || name}`}
  >
    {full_name || name}
  </HomePageLink>
);

const Card = ({
  title,
  children,
}: {
  children: React.ReactNode;
  title: React.ReactNode;
}) => (
  <BorderBox px={4} py={3} width="100%">
    <Heading fontSize={4} fontWeight="bold" mb={5}>
      {title}
    </Heading>

    {children}
  </BorderBox>
);

const CardDivider = (props: React.ComponentProps<typeof Box>) => (
  <Box
    {...props}
    mx={-4}
    sx={{ borderBottom: `1px solid ${theme.colors.border.gray}` }}
  />
);

const CardTitle = ({
  title,
  count,
}: {
  title: React.ReactNode;
  count: number;
}) => (
  <Flex alignItems="center" justifyContent="space-between">
    <Text mr={2}>{title}</Text> {count && <CounterLabel>{count}</CounterLabel>}
  </Flex>
);

const Since = ({ date }: { date: Date }) => (
  <Text color="gray.4">{ago(new Date(date))}</Text>
);

const Event = ({
  event,
  children,
  ...props
}: {
  event: GitHubFeedEvent;
  children: React.ReactNode;
} & React.ComponentProps<typeof Flex>) => (
  <Flex key={event.id} alignItems="baseline" mb={3} {...props}>
    <ActorAvatar actor={event.actor} mr={3} />
    <div>{children}</div>
  </Flex>
);

const Events = <T extends GitHubFeedEvent | Repo>({
  events,
  eventComponent: EventComponent,
  title,
  filterComponent,
  shownFilter = () => true,
}: {
  events: T[];
  eventComponent: React.ComponentType<{ event: T }>;
  title: React.ReactNode;
  filterComponent: React.ReactNode;
  shownFilter: (event: T) => boolean;
}) => {
  const [expanded, expandedSet] = React.useState(false);
  const toggleExpanded = () => expandedSet(!expanded);
  const { fromOtherRepos, fromUsersRepos } = useUserRepoEvents(events);

  const filteredRepos = fromOtherRepos.filter(shownFilter);
  const shownRepos = expanded
    ? filteredRepos
    : filteredRepos.slice(0, 5).filter(shownFilter);
  const shownTitle = (
    <Flex alignItems="center" justifyContent="space-between" mb={4}>
      <Heading fontSize={2}>On Other Repos</Heading>
      {filterComponent}
    </Flex>
  );

  return (
    <Card title={<CardTitle title={title} count={events.length} />}>
      {fromUsersRepos.length > 0 && (
        <>
          <Heading fontSize={2} mb={4}>
            On Your Repos
          </Heading>

          {fromUsersRepos.map((event) => (
            <EventComponent event={event} />
          ))}

          <CardDivider my={5} />

          {shownTitle}
        </>
      )}

      {filterComponent && fromUsersRepos.length === 0 && shownTitle}

      {shownRepos.map((event) => (
        <EventComponent event={event} />
      ))}

      {shownRepos.length >= 5 && (
        <>
          <CardDivider mt={5} />

          <Box
            mx={-4}
            mb={-3}
            px={4}
            py={3}
            sx={{
              borderBottomLeftRadius: theme.radii[2],
              borderBottomRightRadius: theme.radii[2],
              ":hover": { backgroundColor: "blue.0", color: "blue.5" },
              ":focus": {
                backgroundColor: "blue.0",
                color: "blue.5",
                outline: "none",
              },
            }}
            tabIndex={0}
            onClick={toggleExpanded}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                toggleExpanded();
              }
            }}
          >
            <Text>Show {expanded ? "less" : "more"}</Text>
          </Box>
        </>
      )}
    </Card>
  );
};

const ForkEvent = ({ event }: { event: ForkEventType }) => {
  const repo = useRepoInfo(event.repo);
  const [showPopover, showPopoverSet] = React.useState(false);

  return (
    <Relative
      onMouseEnter={() => showPopoverSet(true)}
      onMouseLeave={() => showPopoverSet(false)}
    >
      <Event event={event}>
        <Box>
          <ActorLink {...event.actor} />{" "}
          <span>
            forked <RepoLink repo={event.repo} />
          </span>
        </Box>
        <Since date={event.created_at} />
      </Event>
      <Popover open={showPopover} caret="top" width="100%">
        <Popover.Content mt={2} width="100%">
          <RepoDescription repo={repo} />
        </Popover.Content>
      </Popover>
    </Relative>
  );
};

console.log(theme);

const ReleaseEvent = ({ event }: { event: ReleaseEventType }) => {
  const repo = useRepoInfo(event.repo);
  const [showPopover, showPopoverSet] = React.useState(false);

  return (
    <Relative
      onMouseEnter={() => showPopoverSet(true)}
      onMouseLeave={() => showPopoverSet(false)}
    >
      <Event as="summary" event={event}>
        <Box>
          <ActorLink {...event.actor} />{" "}
          <span>
            released <RepoLink repo={event.repo} />
          </span>{" "}
          <span>at</span>{" "}
          <Link target="_blank" href={event.payload.release.html_url}>
            {event.payload.release.tag_name}
          </Link>
        </Box>
        <Since date={event.created_at} />
      </Event>

      <Popover open={showPopover} caret="top" width="100%">
        <Popover.Content mt={2} width="100%">
          <Heading fontSize={3}>
            {event.payload.release.name || event.payload.release.tag_name}
          </Heading>

          <Text>
            <Markdown>{event.payload.release.body}</Markdown>
          </Text>

          <CardDivider my={4} />

          <RepoDescription repo={repo} />
        </Popover.Content>
      </Popover>
    </Relative>
  );
};

const Language = ({
  language,
  ...props
}: { language: LanguageType } & React.ComponentProps<typeof Flex>) => (
  <Flex alignItems="center" {...props}>
    <Box
      size={10}
      mr={1}
      style={{
        borderRadius: "50%",
        overflow: "hidden",
        backgroundColor: language.node.color || DEFAULT_LANGUAGE_COLOR,
      }}
    />
    <Text color="gray.6">{language.node.name}</Text>
  </Flex>
);

const RepoDescription = ({
  repo,
  users = [],
  ...props
}: {
  repo: ExtendedRepo;
  users?: Actor[];
} & React.ComponentProps<typeof Flex>) => (
  <Flex flexDirection="column" {...props}>
    <RepoLink repo={repo} mb={1} />
    <Text mb={2} color="gray.7">
      {repo.description}
    </Text>
    <Flex alignItems="center" justifyContent="space-between">
      <Flex>
        {repo.languages.edges[0] && (
          <Language language={repo.languages.edges[0]} mr={4} />
        )}
        <Flex alignItems="center" color="gray.6">
          <StarIcon size="small" mr={1} />
          <Text>
            {repo.stargazers.totalCount.toLocaleString()}
          </Text>
        </Flex>
      </Flex>

      <AvatarStack alignRight>
        {users.map((user) => (
          <ActorAvatar actor={user} size={20} />
        ))}
      </AvatarStack>
    </Flex>
  </Flex>
);

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
    <SelectMenu>
      <Button as="summary">
        <Language language={languageFilter || ALL_LANGUAGE} />
      </Button>
      <SelectMenu.Modal>
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
  );
};

const WatchEvents = ({ events }: { events: GitHubFeedEvent[] }) => {
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
      title="Recently Starred"
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

const GithubActivityViewer = (props: EventMap) => (
  <Grid
    px={4}
    py={3}
    gridGap={6}
    gridTemplateColumns={["repeat(1, auto)", "repeat(3, auto)"]}
    alignItems="start"
  >
    <WatchEvents events={props.WatchEvent} />
    <Events
      events={props.ReleaseEvent}
      eventComponent={ReleaseEvent}
      title="Releases"
    />
    <Events
      events={props.ForkEvent}
      eventComponent={ForkEvent}
      title="New Forks"
    />
  </Grid>
);

export default function Home() {
  const { feeds, repoInfo } = useFeeds();

  return (
    <DataContext.Provider value={{ repoInfo }}>
      <Head>
        <title>GitHub Activity</title>
        <link rel="icon" href="/favicon-dark.png" />
      </Head>

      <main>{feeds ? <GithubActivityViewer {...feeds} /> : "Loading..."}</main>
    </DataContext.Provider>
  );
}
