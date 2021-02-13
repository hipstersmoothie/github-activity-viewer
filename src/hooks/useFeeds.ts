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

      try {
        const req = await fetch(url.toString());
        const json: GetFeedResponse = await req.json();

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

        json.events.forEach((event) => {
          if (IGNORE_USERS.includes(event.actor.login)) {
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
          repoInfo: json.repoInfo,
          user: json.user,
          feeds: map,
          recentFollowers: json.recentFollowers,
        };
      } catch (error) {
        Router.push("/api/auth/signin");
      }
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
