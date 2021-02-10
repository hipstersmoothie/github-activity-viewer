/* eslint-disable react/no-danger */
import React from "react";
import Head from "next/head";
import { Grid } from "@primer/components";

import { useTrendingFollowers } from "../hooks/useTrendingFollowers";
import { GridCard } from "../components/Event";
import { TrendingUser } from "../components/TrendingUser";
import { FeaturedUser } from "../components/FeaturedUser";

const App = () => {
  const { featuredUser, trendingInNetwork } = useTrendingFollowers();

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
        showCount={12}
        rows={trendingInNetwork.map((trendingUser) => (
          <TrendingUser key={trendingUser.id} {...trendingUser} />
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
