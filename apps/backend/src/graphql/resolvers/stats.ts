import { getTotalBookingsCount, getTotalConnectionsCount, getTotalHostsCount } from '../../db';

export const statsResolvers = {
  Query: {
    totalHostsCount: (): number => {
      const result = getTotalHostsCount.get() as { count?: number } | undefined;
      return result?.count || 0;
    },
    totalConnectionsCount: (): number => {
      const result = getTotalConnectionsCount.get() as { count?: number } | undefined;
      return result?.count || 0;
    },
    totalBookingsCount: (): number => {
      const result = getTotalBookingsCount.get() as { count?: number } | undefined;
      return result?.count || 0;
    },
  },
  Mutation: {},
};

export default statsResolvers;
