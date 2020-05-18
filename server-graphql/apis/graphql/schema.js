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
    content: String!
    imageUrl: String!
    creator: User!
    createdAt: String!,
    updatedAt: String!
  }

  type AuthData {
    token: String!
    userId: String!
  }

  type PostsData {
    posts: [Post!]!
    totalPosts: Int!
  }

  input UserInputData {
    email: String!
    name: String!
    password: String!
  }

  input CreatePostData {
    title: String!
    content: String!
    imageUrl: String!
  }

  type RootMutation {
    createUser(userInput: UserInputData): User!
    createPost(postInput: CreatePostData): Post!
    updatePost(id: ID!, postInput: CreatePostData!): Post!
    deletePost(id: ID!): Boolean!
    updateUserStatus(status: String!): User!
  }
  
  type RootQuery {
    login(email: String!, password: String!): AuthData!
    posts(page: Int): PostsData!
    post(id: ID!): Post!
    user: User!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);