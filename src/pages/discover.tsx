/* eslint-disable react/no-danger */

import React from "react";
import Head from "next/head";
import { Flex, Grid, Text } from "@primer/components";
import useLocalStorageState from "use-local-storage-state";

import { useTrendingFollowers } from "../hooks/useTrendingFollowers";
import { GridCard } from "../components/Event";
import { TrendingUser } from "../components/TrendingUser";
import { FeaturedUser } from "../components/FeaturedUser";

const App = () => {
  const [previousFeaturedUser, previousFeaturedUserSet] = useLocalStorageState(
    "previousFeaturedUser",
    {
      login: "tannerlinsley",
      date: new Date("2021-02-10T17:31:19.456Z"),
    }
  );
  const { featuredUser, trendingInNetwork } = useTrendingFollowers({
    previousFeaturedUser,
  });

  React.useEffect(() => {
    if (featuredUser && featuredUser.login !== previousFeaturedUser.login) {
      previousFeaturedUserSet({ login: featuredUser.login, date: new Date() });
    }
  }, [featuredUser, previousFeaturedUser.login, previousFeaturedUserSet]);

  // TODO design
  if (!featuredUser) {
    return (
      <Flex>
        <Text fontSize={20}>Uh oh!</Text>
      </Flex>
    );
  }

  return (
    <Grid
      px={4}
      py={3}
      gridGap={6}
      gridTemplateColumns={["2fr 1fr"]}
      alignItems="start"
      maxWidth={1600}
    >
      <FeaturedUser {...featuredUser} />
      <GridCard
        title="Trending In Network"
        showCount={18}
        rows={trendingInNetwork.map((trendingUser) => (
          <TrendingUser
            key={trendingUser.id}
            placement="left"
            {...trendingUser}
          />
        ))}
      />
    </Grid>
  );
};

const Home = () => (
  <>
    <Head>
      <title>Discover</title>
    </Head>
    <App />
  </>
);

export default Home;
