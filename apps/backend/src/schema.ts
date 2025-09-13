export const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;

export const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};