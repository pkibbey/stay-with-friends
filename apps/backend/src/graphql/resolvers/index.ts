/*
  Resolver index - temporary adapter

  For a low-risk migration we keep the existing implementation in
  `src/schema.ts` and re-export the same resolver object from here.
  This lets other parts of the app import from `./graphql/resolvers`
  while we progressively extract resolver groups into the domain files
  in this directory (hosts.ts, users.ts, bookings.ts, ...).
*/

import { hostsResolvers } from './hosts';
import { availabilitiesResolvers } from './availabilities';
import { bookingsResolvers } from './bookings';
import { usersResolvers } from './users';
import { connectionsResolvers } from './connections';
import { invitationsResolvers } from './invitations';
import { statsResolvers } from './stats';

export const resolvers = {
  Query: {
    ...hostsResolvers.Query,
    ...availabilitiesResolvers.Query,
    ...bookingsResolvers.Query,
    ...usersResolvers.Query,
    ...connectionsResolvers.Query,
    ...invitationsResolvers.Query,
    ...statsResolvers.Query,
  },
  Mutation: {
    ...hostsResolvers.Mutation,
    ...availabilitiesResolvers.Mutation,
    ...bookingsResolvers.Mutation,
    ...usersResolvers.Mutation,
    ...connectionsResolvers.Mutation,
    ...invitationsResolvers.Mutation,
  },
  Host: {
    ...hostsResolvers.Host,
  },
  Availability: {
    ...availabilitiesResolvers.Availability,
  },
  BookingRequest: {
    ...bookingsResolvers.BookingRequest,
  },
  User: {
    ...usersResolvers.User,
  },
  Connection: {
    ...connectionsResolvers.Connection,
  },
  Invitation: {
    ...invitationsResolvers.Invitation,
  },
};

export default resolvers;
