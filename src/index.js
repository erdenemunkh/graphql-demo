const { PrismaClient } = require('@prisma/client');
const { ApolloServer, gql } = require('apollo-server');

const prisma = new PrismaClient();

// Type definition
const typeDefs = gql`
  type User {
    id: Int
    email: String!
    name: String
    posts: [Post]
  }

  type Post {
    id: Int
    title: String
    content: String
    published: Boolean
    authorId: Int
    author: User
  }

  type Query {
    allUsers: [User!]!    
    allPosts: [Post!]!
    post(authorId: ID!): [Post]!
  }

`;

const resolver = {
  Query: {
    allUsers: async (parent, args, context, info) => {
      return await prisma.user.findMany();
    },
    allPosts: async (parent, args, context, info) => {
      return await prisma.post.findMany();
    },
    post: async (parent, args, context, info) => {
      return await prisma.post.findMany({
        where: {
          authorId: Number(args.authorId),
        }
      })
    }
  },
  User: {
    posts: async (parent) => {
      return await prisma.post.findMany({
        where: {
          authorId: parent.id,
        }
      })
    }
  },
  Post: {
    author: async (parent) => {
      return await prisma.user.findUnique({
        where: {
          id: parent.authorId,
        }
      })
    }
  }
};

const port = 4040;
const serverConfig = {
  port: port,
  cors: true,
  typeDefs,
  resolvers: resolver,
};
const server = new ApolloServer(serverConfig);

server.listen({ port }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});