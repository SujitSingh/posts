const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type User {
    _id: ID
    name: String!
    email: String!
    password: String
    status: String!
    posts: [Post!]!
  }
  type Post {
    _id: ID
    title: String!
    imageUrl: String!
    creator: User!
    createdAt: String!,
    updatedAt: String!
  }

  type AuthData {
    token: String!
    userId: String!
  }

  input UserInputData {
    email: String!
    name: String!
    password: String!
  }

  type RootMutation {
    createUser(userInput: UserInputData): User!
  }

  type RootQuery {
    login(email: String!, password: String!): AuthData!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);