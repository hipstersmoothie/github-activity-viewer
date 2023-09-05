import * as React from "react";
import { Link } from "@primer/react";

import { Repo, User } from "../utils/types";

export const HomePageLink = (props: React.ComponentProps<typeof Link>) => (
  <Link
    color="bodytext"
    sx={{
      fontWeight: "bold",
      ":hover": {
        textDecoration: "none",
        color: "blue.5",
      },
    }}
    {...props}
  />
);

export const ActorLink = (props: Pick<User, "login">) => (
  <HomePageLink target="_blank" href={`https://github.com/${props.login}`}>
    {props.login}
  </HomePageLink>
);

interface RepoLinkProps extends React.ComponentProps<typeof Link> {
  repo: Partial<Pick<Repo, "full_name" | "name">>;
}

export const RepoLink = ({
  repo: { full_name, name },
  ...props
}: RepoLinkProps) => (
  <HomePageLink
    {...props}
    target="_blank"
    href={`https://github.com/${full_name || name}`}
  >
    {full_name || name}
  </HomePageLink>
);
