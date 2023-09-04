import fetch from "isomorphic-fetch";
import useSWR from "swr";
import Router from "next/router";
import join from "url-join";

import { GetTrendingFollowersResponse } from "../utils/types";
import { useWindowFocus } from "./useWindowFocus";

interface UseTrendingFollowersOptions {
  previousFeaturedUser: {
    login: string;
    date: Date;
  };
}

export const useTrendingFollowers = (options: UseTrendingFollowersOptions) => {
  const windowFocus = useWindowFocus();
  const { data } = useSWR(
    `/api/get-trending-followers`,
    async () => {
      const url = new URL(
        join(
          process.env["SITE"] || "http://localhost:3000",
          "/api/get-trending-followers"
        )
      );
      url.search = new URLSearchParams({
        previousFeaturedUser: options.previousFeaturedUser.login,
        previousFeaturedUserDate: options.previousFeaturedUser.date.toString(),
      }).toString();

      try {
        const req = await fetch(url.toString());
        const json: GetTrendingFollowersResponse = await req.json();

        return json;
      } catch (error) {
        Router.push("/sign-in");
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
