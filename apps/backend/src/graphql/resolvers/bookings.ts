import type { AuthContext } from '../context';
import { getBookingRequestsByHost, getBookingRequestsByRequester, getBookingRequestById, insertBookingRequest, updateBookingRequestStatus, getAllHosts, getPendingBookingRequestsCountByHostUser, getHostById, getAvailabilitiesByDateRange, insertAvailability, db, getUserById } from '../../db';
import { BookingRequest } from '@stay-with-friends/shared-types';
import { validateUUID, validateDateRange, validatePositiveInteger, validateStatus } from '../validators';
import { v4 as uuidv4 } from 'uuid';

export const bookingsResolvers = {
  Query: {
    bookingRequestsByHost: (_parent: unknown, { hostId }: { hostId: string }, context: AuthContext): BookingRequest[] => {
      if (!context.user) throw new Error('Authentication required');
      const host = getHostById.get(hostId) as unknown as Record<string, unknown> | undefined;
      if (!host || (host.user_id as string | undefined) !== context.user.id) throw new Error('Unauthorized: Can only view booking requests for your own hosts');
      return getBookingRequestsByHost.all(hostId) as BookingRequest[];
    },
    bookingRequestsByRequester: (_parent: unknown, { requesterId }: { requesterId: string }, context: AuthContext): BookingRequest[] => {
      if (!context.user) throw new Error('Authentication required');
      if (context.user.id !== requesterId) throw new Error('Unauthorized: Can only view your own booking requests');
      return getBookingRequestsByRequester.all(requesterId) as BookingRequest[];
    },
    bookingRequestsByHostUser: (_parent: unknown, { userId }: { userId: string }, context: AuthContext) => {
      if (!context.user) throw new Error('Authentication required');
      if (context.user.id !== userId) throw new Error('Unauthorized: Can only view booking requests for your own hosts');
      const allHosts = getAllHosts.all();
      const userHosts = allHosts.filter((host: unknown) => (host as Record<string, unknown>).user_id === userId);
      const allRequests: Record<string, unknown>[] = [];
      for (const host of userHosts) {
        const requests = getBookingRequestsByHost.all((host as Record<string, unknown>).id) as Record<string, unknown>[];
        allRequests.push(...requests);
      }
      return allRequests.sort((a, b) => new Date((b.created_at as string) || '').getTime() - new Date((a.created_at as string) || '').getTime());
    },
    pendingBookingRequestsCount: (_parent: unknown, { userId }: { userId: string }, context: AuthContext) => {
      if (!context.user) throw new Error('Authentication required');
      if (context.user.id !== userId) throw new Error('Unauthorized: Can only view your own pending requests count');
      const result = getPendingBookingRequestsCountByHostUser.get(userId) as unknown as { count?: number } | undefined;
      return result?.count || 0;
    },
  },
  Mutation: {
    createBookingRequest: (_parent: unknown, args: Record<string, unknown>, context: AuthContext): BookingRequest => {
      if (!context.user) throw new Error('Authentication required');
      validateUUID(args.hostId as string, 'Host ID');
      const requesterId = args.requesterId as string | undefined;
      if (!requesterId) throw new Error('Requester ID is required');
      if (requesterId !== context.user.id) throw new Error('Unauthorized: Can only create booking requests for yourself');
      validateDateRange(args.startDate as string, args.endDate as string);
      validatePositiveInteger(args.guests as number, 'Guests count', 50);
      const newBookingId = uuidv4();
      insertBookingRequest.run(newBookingId, args.hostId, requesterId, args.startDate, args.endDate, args.guests, args.message, 'pending');
      return { id: newBookingId, host_id: args.hostId as string, requester_id: requesterId, start_date: args.startDate as string, end_date: args.endDate as string, guests: args.guests as number, message: args.message as string | undefined, status: 'pending', created_at: new Date().toISOString() } as BookingRequest;
    },
    updateBookingRequestStatus: (_parent: unknown, { id, status, responseMessage }: { id: string, status: string, responseMessage?: string }, context: AuthContext): BookingRequest => {
      if (!context.user) throw new Error('Authentication required');
      validateStatus(status, ['pending', 'approved', 'declined', 'cancelled']);
      const bookingRequest = getBookingRequestById.get(id) as unknown as Record<string, unknown> | undefined;
      if (!bookingRequest) throw new Error('Booking request not found');
      const host = getHostById.get(bookingRequest.host_id as string) as unknown as Record<string, unknown> | undefined;
      if (!host || (host.user_id as string | undefined) !== context.user.id) throw new Error('Unauthorized: Can only update booking requests for your own hosts');
      updateBookingRequestStatus.run(status, responseMessage || null, id);
      if (status === 'approved') {
        const overlappingAvailabilities = getAvailabilitiesByDateRange.all(bookingRequest.end_date as string, bookingRequest.start_date as string) as unknown[];
        if (overlappingAvailabilities.length === 0) {
          insertAvailability.run(bookingRequest.host_id as string, bookingRequest.start_date as string, bookingRequest.end_date as string, 'booked', `Booked by ${(bookingRequest.requester_name as string) || (bookingRequest.requester_email as string)}`);
        } else {
          db.prepare(`UPDATE availabilities SET status = 'booked', notes = ? WHERE host_id = ? AND start_date <= ? AND end_date >= ? AND status = 'available'`).run(`Booked by ${(bookingRequest.requester_name as string) || (bookingRequest.requester_email as string)}`, bookingRequest.host_id, bookingRequest.end_date, bookingRequest.start_date);
        }
      }
      return getBookingRequestById.get(id) as BookingRequest;
    },
  },
  BookingRequest: {
    host: (parent: BookingRequest) => getHostById.get(parent.host_id),
    hostId: (parent: BookingRequest) => parent.host_id,
    requesterId: (parent: BookingRequest) => parent.requester_id,
    requester: (parent: BookingRequest) => {
      const user = getUserById.get(parent.requester_id);
      if (!user) {
        return { id: parent.requester_id, email: 'unknown@example.com', name: 'Unknown User', image: null, email_verified: null, created_at: new Date().toISOString() };
      }
      return user;
    },
    startDate: (parent: BookingRequest) => parent.start_date,
    endDate: (parent: BookingRequest) => parent.end_date,
    createdAt: (parent: BookingRequest) => parent.created_at,
    responseMessage: (parent: BookingRequest) => parent.response_message,
    respondedAt: (parent: BookingRequest) => parent.responded_at,
  },
};

export default bookingsResolvers;
