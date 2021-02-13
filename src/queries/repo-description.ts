import { gql } from "../utils/gql";

export const RepoDescription = gql`
  query RepoDescription {
    repository(owner: "$owner: String!", name: "$name: String!") {
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
