import * as React from "react";
import Head from "next/head";
import { Text, Box } from "@primer/react";
import useLocalStorageState from "use-local-storage-state";

import { useTrendingFollowers } from "../hooks/useTrendingFollowers";
import { GridCard } from "../components/Event";
import { TrendingUser } from "../components/TrendingUser";
import { FeaturedUser } from "../components/FeaturedUser";
import { Card } from "../components/Card";
import { TrendingActor } from "../utils/types";
import { SidebarLayout } from "../components/Sidebar";

const App = () => {
  const [previousFeaturedUser, previousFeaturedUserSet] = useLocalStorageState(
    "previousFeaturedUser",
    {
      login: "tannerlinsley",
      date: new Date("2021-02-10T17:31:19.456Z"),
    }
  );
  const { featuredUser, trendingInNetwork, suggested } = useTrendingFollowers({
    previousFeaturedUser,
  });

  React.useEffect(() => {
    if (featuredUser && featuredUser.login !== previousFeaturedUser.login) {
      previousFeaturedUserSet({ login: featuredUser.login, date: new Date() });
    }
  }, [featuredUser, previousFeaturedUser.login, previousFeaturedUserSet]);

  if (!featuredUser) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Text as="h1" fontSize={40} mb={4} mt={0}>
            Uh oh!
          </Text>
          <Text as="p" fontSize={24} mt={0} mb={6}>
            You don&apos;t seem to have any followers in your network.
          </Text>

          <Card width="fit-content" px={6} pb={6}>
            <Text
              as="p"
              fontSize={18}
              mt={4}
              mb={6}
              color="fg.default"
              textAlign="center"
            >
              Try following some of these popular accounts:
            </Text>

            <Box
              display="flex"
              flexDirection="column"
              width="fit-content"
              mx="auto"
              minWidth={250}
            >
              {suggested.map((user) => (
                <TrendingUser
                  key={user.id}
                  {...(user as TrendingActor)}
                  isAuthenticatedUserFollowing
                />
              ))}
            </Box>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      display="grid"
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
    </Box>
  );
};

const Home = () => (
  <>
    <Head>
      <title>Discover</title>
    </Head>
    <SidebarLayout>
      <App />
    </SidebarLayout>
  </>
);

export default Home;
