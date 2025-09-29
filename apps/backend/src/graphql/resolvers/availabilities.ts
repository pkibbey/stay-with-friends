import type { AuthContext } from '../context';
import { getHostAvailabilities, getAvailabilitiesByDateRange, getAvailabilityDates, insertAvailability, getHostById } from '../../db';
import { Availability } from '@stay-with-friends/shared-types';
import { validateDateRange, validateUUID, validateStatus, validateOptionalText } from '../validators';
import { v4 as uuidv4 } from 'uuid';

export const availabilitiesResolvers = {
  Query: {
    availabilitiesByDate: (_parent: unknown, { date }: { date: string }): Availability[] => {
      return getAvailabilitiesByDateRange.all(date, date) as Availability[];
    },
    availabilitiesByDateRange: (_parent: unknown, { startDate, endDate }: { startDate: string, endDate: string }): Availability[] => {
      return getAvailabilitiesByDateRange.all(endDate, startDate) as Availability[];
    },
    hostAvailabilities: (_parent: unknown, { hostId }: { hostId: string }): Availability[] => {
      return getHostAvailabilities.all(hostId) as Availability[];
    },
    availabilityDates: (_parent: unknown, { startDate, endDate }: { startDate: string, endDate: string }) => {
      const results = getAvailabilityDates.all(startDate, endDate, endDate, startDate) as { date: string }[];
      return results.map(row => row.date);
    },
  },
  Mutation: {
    createAvailability: (_parent: unknown, args: Record<string, unknown>, context: AuthContext): Availability => {
      if (!context.user) throw new Error('Authentication required');
      validateUUID(args.hostId as string, 'Host ID');
      validateDateRange(args.startDate as string, args.endDate as string);
      const host = getHostById.get(args.hostId as string) as unknown as Record<string, unknown> | undefined;
      if (!host || (host.user_id as string | undefined) !== context.user.id) throw new Error('Unauthorized: Can only manage availability for your own hosts');
      if (args.status) validateStatus(args.status as string, ['available', 'unavailable', 'booked']);
      validateOptionalText(args.notes as string | undefined, 'Notes', 500);
      const newAvailabilityId = uuidv4();
      insertAvailability.run(newAvailabilityId, args.hostId as string, args.startDate as string, args.endDate as string, args.status as string || 'available', args.notes as string | undefined);
      return { id: newAvailabilityId, host_id: args.hostId as string, start_date: args.startDate as string, end_date: args.endDate as string, status: (args.status as string) || 'available', notes: (args.notes as string) || null } as Availability;
    },
  },
  Availability: {
    host: (parent: Availability) => getHostById.get(parent.host_id),
    startDate: (parent: Availability) => parent.start_date,
    endDate: (parent: Availability) => parent.end_date,
    hostId: (parent: Availability) => parent.host_id,
  },
};

export default availabilitiesResolvers;
