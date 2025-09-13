export const typeDefs = `#graphql
  type Person {
    id: ID!
    name: String!
    location: String
    relationship: String
    availability: String
    description: String
  }

  type Query {
    hello: String
    people: [Person!]!
    searchPeople(query: String!): [Person!]!
    person(id: ID!): Person
  }

  type Mutation {
    createPerson(
      name: String!
      location: String
      relationship: String
      availability: String
      description: String
    ): Person!
  }
`;

import { getAllPeople, getPersonById, searchPeople, insertPerson } from './db';

export const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    people: () => getAllPeople.all(),
    searchPeople: (_: any, { query }: { query: string }) => {
      const searchTerm = `%${query}%`;
      return searchPeople.all(searchTerm, searchTerm, searchTerm);
    },
    person: (_: any, { id }: { id: string }) => {
      return getPersonById.get(id);
    },
  },
  Mutation: {
    createPerson: (_: any, args: any) => {
      const result = insertPerson.run(
        args.name,
        args.location,
        args.relationship,
        args.availability,
        args.description
      );
      return {
        id: result.lastInsertRowid,
        ...args,
      };
    },
  },
};