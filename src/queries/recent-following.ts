import { gql } from "../utils/gql";

export const RecentFollowing = gql`
  query RecentFollowing {
    user(login: "$login: String!") {
      following(first: 3) {
        totalCount
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
