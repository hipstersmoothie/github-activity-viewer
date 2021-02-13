import { gql } from "../utils/gql";

export const RecentFollowers = gql`
  query RecentFollowers {
    user(login: "$login: String!") {
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
