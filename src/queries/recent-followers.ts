import { gql } from "../utils/gql";

export const RecentFollowers = gql`
  query RecentFollowers($login: String!) {
    user(login: $login) {
      followers(first: 10) {
        nodes {
          login
          id
          avatar_url: avatarUrl
          bioHTML
          company
          location
          name
          websiteUrl
          twitterUsername
          followers {
            totalCount
          }
          status {
            emojiHTML
            message
          }
        }
      }
    }
  }
`;
