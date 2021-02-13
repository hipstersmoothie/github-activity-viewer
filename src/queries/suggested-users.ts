import { gql } from "../utils/gql";

export const SuggestedUsers = gql`
  query SuggestedUsers {
    sindresorhus: user(login: "sindresorhus") {
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
    emmabostian: user(login: "emmabostian") {
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
    rauchg: user(login: "rauchg") {
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
`;
