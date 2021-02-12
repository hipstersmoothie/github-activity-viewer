import fetch from "isomorphic-fetch";
import useSWR from "swr";
import Router from "next/router";

import { EventMap, GetFeedResponse } from "../utils/types";
import { useWindowFocus } from "./useWindowFocus";

const IGNORE_USERS = ["renovate"];

export const useFeeds = (active: "following" | "user") => {
  const windowFocus = useWindowFocus();
  const { data } = useSWR(
    `/api/get-feed/${active}`,
    async () => {
      const url = new URL(
        `${process.env["SITE"] || "http://localhost:3000"}/api/get-feed`
      );
      url.search = new URLSearchParams({ active }).toString();

      return fetch(url.toString())
        .then((res) => res.json())
        .then((res: GetFeedResponse) => {
          const map: EventMap = {
            ReleaseEvent: [],
            WatchEvent: [],
            PushEvent: [],
            PullRequestEvent: [],
            PullRequestReviewCommentEvent: [],
            CreateEvent: [],
            CommitCommentEvent: [],
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

            if (map[event.type]) {
              map[event.type].push(event);
            } else {
              // eslint-disable-next-line no-console
              console.log("Missing event bucket: ", event.type);
            }
          });

          return {
            repoInfo: res.repoInfo,
            user: res.user,
            feeds: map,
            recentFollowers: res.recentFollowers,
          };
        })
        .catch(() => Router.push("/api/auth/signin"));
    },
    {
      suspense: true,
      // Refresh every 5 minutes in the background but not when window is focused
      revalidateOnFocus: false,
      refreshWhenHidden: !windowFocus,
      refreshInterval: windowFocus ? undefined : 5 * 60 * 1000,
    }
  );

  return data || ({} as Partial<NonNullable<typeof data>>);
};
