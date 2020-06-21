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

const IGNORE_USERS = ["renovate"];

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
          if (IGNORE_USERS.includes(event.actor.display_login)) {
            return;
          }

          map[event.type].push(event);
        });

        repoInfoSet(res.repoInfo);
        feedsSet(map);
      });
  }, []);

  return { feeds, repoInfo };
};

const useUser = () => {
  return {
    status: "my website is hot garbage.",
    name: "Andrew Lisowski",
    display_login: "hipstersmoothie",
    login: "hipstersmoothie",
    avatar_url: "https://avatars3.githubusercontent.com/u/1192452",
  };
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
  const { login } = useUser();
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
  <BorderBox px={4} py={3} width="100%" backgroundColor="white">
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
  showCount = 5,
}: {
  events: T[];
  eventComponent: React.ComponentType<{ event: T }>;
  title: React.ReactNode;
  filterComponent?: React.ReactNode;
  shownFilter?: (event: T) => boolean;
  showCount?: number;
}) => {
  const [expanded, expandedSet] = React.useState(false);
  const toggleExpanded = () => expandedSet(!expanded);
  const { fromOtherRepos, fromUsersRepos } = useUserRepoEvents(events);

  const filteredRepos = fromOtherRepos.filter(shownFilter);
  const shownRepos = expanded
    ? filteredRepos
    : filteredRepos.slice(0, showCount).filter(shownFilter);
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

      {shownRepos.length >= showCount && (
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
          <Text>{repo.stargazers.totalCount.toLocaleString()}</Text>
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

const CreateEvent = ({ event }: { event: GitHubFeedEvent }) => {
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
            created <RepoLink repo={event.repo} />
          </span>
        </Box>
      </Event>
      <Popover open={showPopover} caret="top" width="100%">
        <Popover.Content mt={2} width="100%">
          <RepoDescription repo={repo} />
        </Popover.Content>
      </Popover>
    </Relative>
  );
};

const GithubActivityViewer = (props: EventMap) => (
  <Grid
    px={4}
    py={3}
    gridGap={6}
    gridTemplateColumns={["repeat(1, auto)", "repeat(4, auto)"]}
    alignItems="start"
  >
    <Grid gridGap={6}>
      <Events
        events={props.ReleaseEvent}
        eventComponent={ReleaseEvent}
        title="Releases"
      />
      <Events
        events={props.CreateEvent.filter((e) => e.payload.ref_type !== "tag")}
        eventComponent={CreateEvent}
        title="New Repos"
        showCount={9}
      />
    </Grid>
    <WatchEvents events={props.WatchEvent} />
  </Grid>
);

const Spinner = () => (
  <>
    <Flex alignItems="center" justifyContent="center" height="100vh">
      <svg
        id="octo"
        viewBox="0 0 512 512"
        width="20px"
        height="20px"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          id="part1"
          className="part"
          d="m332.289429,87.087219c60.033295,-20.366676 114.402222,-21.83609 172.935547,1.047241l-11.403595,32.850952c-43.333344,-15.5 -104.147491,-15.984329 -148.480804,-0.734329"
          transform="rotate(45 418.757 96.1885)"
        />
        <path
          id="part2"
          className="part"
          d="m398.527466,246.388596c60.033325,-20.366684 114.402222,-21.83609 172.935547,1.047241l-11.403564,32.850967c-43.333374,-15.500031 -104.147491,-15.984344 -148.480835,-0.734344"
          transform="rotate(90 484.995 255.49)"
        />
        <path
          id="part3"
          className="part"
          d="m331.332214,404.823669c60.033325,-20.366699 114.402252,-21.83609 172.935547,1.047241l-11.403534,32.850952c-43.333405,-15.500031 -104.147522,-15.984344 -148.480865,-0.734344"
          transform="rotate(135 417.8 413.925)"
        />
        <path
          id="part4"
          className="part"
          d="m171.58223,470.323669c60.03331,-20.366699 114.402237,-21.83609 172.935532,1.047241l-11.403534,32.850952c-43.333405,-15.500031 -104.147522,-15.984344 -148.48085,-0.734344"
          transform="rotate(180 258.05 479.425)"
        />
        <path
          id="part5"
          className="part"
          d="m13.0822,406.074005c60.033301,-20.367004 114.401801,-21.835999 172.935805,1.046997l-11.404007,32.850983c-43.332993,-15.5 -104.147301,-15.983978 -148.480589,-0.733978"
          transform="rotate(-135 99.55 415.175)"
        />
        <path
          id="part6"
          className="part"
          d="m-53.713486,247.091553c60.03331,-20.367004 114.40181,-21.835999 172.935806,1.046997l-11.404022,32.850983c-43.332977,-15.5 -104.147277,-15.983978 -148.480576,-0.733978"
          transform="rotate(-90 32.754 256.193)"
        />
        <path
          id="part7"
          className="part"
          d="m12.883621,87.061485c60.033295,-20.366669 114.402206,-21.836082 172.935562,1.047249l-11.403595,32.850952c-43.333344,-15.5 -104.147507,-15.984329 -148.48082,-0.734337"
          transform="rotate(-45 99.3514 96.1628)"
        />
        <path
          id="part8"
          className="part"
          d="m172.906631,20.929741c60.03331,-20.366681 114.402206,-21.836091 172.935562,1.04723l-11.403595,32.85096c-43.333344,-15.5 -104.147507,-15.984322 -148.48082,-0.734329"
        />
        <path
          id="cat"
          d="m197.75,459.850006c0,0 -0.125,-48.75 -0.125,-48.850006c0,-0.100006 -4.75,-4.399994 -33,-1c-28.25,3.399994 -62.5,-66.649994 -65.25,-69.75c-2.75,-3.100006 14,-5.649994 26.5,5c12.5,10.649994 38.25,33.350006 38.5,33.25c0.25,-0.100006 31.75,0.600006 31.75,0.5c0,-0.100006 3,-44.149994 20.75,-37.5c17.75,6.649994 -72.5,1.350006 -97.75,-61.25c-25.25,-62.600006 19.25,-124.899994 20.25,-115.399994c1,9.5 -17,-35 -10.25,-46.850006c6.75,-11.849998 19.25,-9.400002 30.25,-5.5c11,3.900002 34.25,20.350006 39.25,21.25c5,0.899994 18.25,-8.150002 59.25,-7.5c41,0.650002 52.769196,6.138474 56.75,6.5c3.980804,0.361526 30.519165,-17.38076 38.250061,-22.557701c7.730896,-5.176941 18.653595,-9.092308 28.653687,0.78849c10.000092,9.880798 4.923157,67.00383 3.096252,55.519211c-1.826904,-11.484619 36.25,70.600006 6,122.100006c-30.25,51.5 -99.25,52.75 -87.75,55.899994c11.5,3.149994 15,33.350006 14.75,49.850006l-0.25,65.899994l-22.875,3.875l-0.5,-74.75c0.125,-9.225006 -9.125,-10.649994 -9.625,-9.75l-0.25,85.875l-21.25,1.25l-0.25,-86.75l-10.5,0l0,86.5l-20.75,-1l-0.25,-84.25c0,-0.100006 -8.75,-1.149994 -8.25,10.75l-0.5,72.25"
        />
      </svg>
    </Flex>
    <style global>{`
      #octo #cat { fill: #fff }
      #octo { position: fixed; height: 100px; width: 100% }
      #octo .part {
        animation-name: fade;
        animation-duration: 1s;
        animation-iteration-count: infinite;
        animation-timing-function: ease-out;
        fill: ${theme.colors.gray[3]};
      }
      
      #octo #part1 { animation-delay: 0.000s }
      #octo #part2 { animation-delay: 0.125s }
      #octo #part3 { animation-delay: 0.250s }
      #octo #part4 { animation-delay: 0.375s }
      #octo #part5 { animation-delay: 0.500s }
      #octo #part6 { animation-delay: 0.625s }
      #octo #part7 { animation-delay: 0.750s }
      #octo #part8 { animation-delay: 0.875s }
      
      @keyframes fade {
          0%,25%  { fill: #fff }
          50%,75% { fill: ${theme.colors.gray[4]} }
      }
    `}</style>
  </>
);

export default function Home() {
  const { feeds, repoInfo } = useFeeds();
  console.log(feeds);

  return (
    <DataContext.Provider value={{ repoInfo }}>
      <Head>
        <title>GitHub Activity</title>
        <link rel="icon" href="/favicon-dark.png" />
      </Head>

      <main style={{ background: theme.colors.gray[1], minHeight: "100vh" }}>
        {feeds ? <GithubActivityViewer {...feeds} /> : <Spinner />}
      </main>
    </DataContext.Provider>
  );
}
