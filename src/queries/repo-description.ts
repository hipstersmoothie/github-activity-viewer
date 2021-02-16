import { gql } from "../utils/gql";

export const RepoDescription = gql`
  query RepoDescription($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      name
      description
      url
      updatedAt
      languages(first: 1, orderBy: { field: SIZE, direction: DESC }) {
        edges {
          node {
            color
            name
          }
        }
      }
      stargazers {
        totalCount
      }
    }
  }
`;
