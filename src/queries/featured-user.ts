import { gql } from "../utils/gql";

export const FeaturedUser = gql`
  query FeaturedUser($login: String!) {
    user(login: $login) {
      contributionsCollection {
        pullRequestContributions(orderBy: { direction: DESC }, first: 100) {
          edges {
            node {
              pullRequest {
                title
                url
                bodyHTML
                number
                state
                labels(first: 10) {
                  nodes {
                    name
                    color
                    description
                  }
                }
                repository {
                  description
                  nameWithOwner
                  url
                  stargazerCount
                  forkCount
                }
              }
            }
          }
        }
      }

      repositories(
        orderBy: { field: STARGAZERS, direction: DESC }
        first: 6
        ownerAffiliations: OWNER
      ) {
        edges {
          node {
            name
            url
            description
            stargazerCount
            forkCount
            languages(first: 1) {
              edges {
                node {
                  name
                  color
                }
              }
            }
          }
        }
      }

      pinnedItems(first: 6) {
        edges {
          node {
            ... on Gist {
              name
              url
              description
              stargazerCount
            }
            ... on Repository {
              name
              url
              description
              stargazerCount
              forkCount
              languages(first: 1) {
                edges {
                  node {
                    name
                    color
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
