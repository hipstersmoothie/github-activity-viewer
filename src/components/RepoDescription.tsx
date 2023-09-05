import { Box, BoxProps, Text, AvatarStack, Spinner } from "@primer/react";
import { compiler } from "markdown-to-jsx";
import useSWR from "swr";
import { Suspense, cloneElement, createElement } from "react";
import { useCookies } from "react-cookie";

import { User, ExtendedRepo, Repo } from "../utils/types";
import { RepoLink } from "./HomePageLink";
import { renderEmoji } from "../utils/renderEmoji";
import { ActorAvatar } from "./ActorAvatar";
import { Language } from "./Language";
import { StarCount } from "./StarCount";
import { TwitterIcon } from "./TwitterIcon";
import PopperPopover from "./Popover";
import { useOctokit } from "../utils/useOctokit";

const ReadMe = ({ repo }: { repo: ExtendedRepo | Repo }) => {
  const octokit = useOctokit();
  const [{ colorMode }] = useCookies(["colorMode"]);
  const { data: contents } = useSWR(
    `${repo.name}-readme`,
    async (): Promise<string | JSX.Element> => {
      if (!octokit) {
        return "";
      }

      const [owner, repoName] = repo.name.split("/") as [string, string];

      try {
        const [htmlRes, mdRes] = await Promise.all([
          octokit.rest.repos.getReadme({
            owner,
            repo: repoName,
            mediaType: { format: "html" },
          }),
          octokit.rest.repos.getReadme({
            owner,
            repo: repoName,
          }),
        ]);

        if (
          !mdRes ||
          !("download_url" in mdRes.data) ||
          !mdRes.data.download_url ||
          !("content" in mdRes.data) ||
          !mdRes.data.content
        ) {
          return "No README.md";
        }

        const base = mdRes.data.download_url.replace(`/${mdRes.data.name}`, "");
        // Fix Image URLs
        const jsx = compiler((htmlRes.data as unknown) as string, {
          // eslint-disable-next-line react/no-unstable-nested-components
          createElement(tag, tagProps, tagChildren) {
            if (base && tag === "img") {
              const imgProps = tagProps as React.ComponentProps<"img">;
              if (imgProps.src) {
                if (imgProps.src.startsWith("./")) {
                  imgProps.src = `${base}${imgProps.src.replace("./", "/")}`;
                } else if (!imgProps.src.startsWith("http")) {
                  imgProps.src = `${base}/${imgProps.src}`;
                } else if (imgProps.src.startsWith("https//")) {
                  imgProps.src = imgProps.src.replace("https//", "https://");
                } else if (imgProps.src.startsWith("http//")) {
                  imgProps.src = imgProps.src.replace("http//", "http://");
                } else if (imgProps.src.startsWith("http/")) {
                  imgProps.src = imgProps.src.replace("http/", "http://");
                } else if (imgProps.src.startsWith("https/")) {
                  imgProps.src = imgProps.src.replace("https/", "https://");
                }

                imgProps.style = {
                  maxWidth: "100%",
                  maxHeight: "40vh",
                  margin: "auto",
                  display: "block",
                };
              }
            }

            return createElement(tag, tagProps, tagChildren);
          },
        });
        const mdJsx = compiler(window.atob(mdRes.data.content));
        const pres = await Promise.all(
          mdJsx.props.children.map(async (child: JSX.Element) => {
            if (typeof child !== "object" || child.type !== "pre") {
              return undefined;
            }

            const lang = child.props.children.props.className?.replace(
              "lang-",
              ""
            );
            const code = child.props.children.props.children;

            try {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const html = await window.codeToHtml(code, {
                lang,
                theme: colorMode === "day" ? "github-light" : "github-dark",
              });

              return html;
            } catch (error) {
              console.log(error);
            }
          })
        );

        const newEl = cloneElement(
          jsx,
          {},
          cloneElement(
            jsx.props.children[0],
            {},
            await Promise.all(
              jsx.props.children[0].props.children.map(
                async (child: JSX.Element, index: number) => {
                  if (
                    typeof child !== "object" ||
                    child.type !== "div" ||
                    !child.props.class?.includes("highlight") ||
                    child.props.children[0].type !== "pre"
                  ) {
                    return child;
                  }

                  return createElement(
                    "div",
                    {
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      dangerouslySetInnerHTML: {
                        __html: pres[index],
                      },
                    },
                    undefined
                  );
                }
              )
            )
          )
        );

        return newEl;
      } catch (error) {
        console.log(error);
        return "Failed to load README.md";
      }
    },
    {
      suspense: true,
    }
  );

  return <Text className="markdown-body">{contents}</Text>;
};

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
    <PopperPopover
      placement="left"
      maxWidth={500}
      trigger={
        <Box display="flex" flexDirection="column" {...props}>
          <RepoLink repo={repo} />

          {repo.description && (
            <Text mb={2} color="fg.default">
              {renderEmoji(repo.description)}
            </Text>
          )}

          {hasRepoInfo && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
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
                    <ActorAvatar
                      key={user.id}
                      showTooltip
                      actor={user}
                      size={20}
                    />
                  ))}
                </AvatarStack>
              )}
            </Box>
          )}
        </Box>
      }
    >
      <Suspense
        fallback={
          <Box width="100%" display="flex" justifyContent="center">
            <Spinner />
          </Box>
        }
      >
        <ReadMe repo={repo} />
      </Suspense>
    </PopperPopover>
  );
};
