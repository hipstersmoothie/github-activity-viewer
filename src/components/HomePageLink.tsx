import * as React from "react";
import { Link } from "@primer/components";
import { Repo, Actor } from "../utils/types";

const HomePageLink = (props: React.ComponentProps<typeof Link>) => (
  <Link
    color="bodytext"
    fontWeight="bold"
    sx={{
      ":hover": {
        textDecoration: "none",
        color: "blue.5",
      },
    }}
    {...props}
  />
);

export const ActorLink = (props: Actor) => (
  <HomePageLink target="_blank" href={`https://github.com/${props.login}`}>
    {props.login}
  </HomePageLink>
);

interface RepoLinkProps extends React.ComponentProps<typeof Link> {
  repo: Repo;
}

export const RepoLink = ({ repo: { full_name, name }, ...props }: RepoLinkProps) => (
  <HomePageLink
    {...props}
    target="_blank"
    href={`https://github.com/${full_name || name}`}
  >
    {full_name || name}
  </HomePageLink>
);
