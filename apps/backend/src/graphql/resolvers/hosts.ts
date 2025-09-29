import type { AuthContext } from '../context';
import { getAllHosts, getHostById, getUserById, getUserByEmail, searchHosts, insertHost, getHostAvailabilities, db } from '../../db';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Host } from '@stay-with-friends/shared-types';
import { validateName, validateOptionalText, validateCoordinates, validatePositiveInteger } from '../validators';

type SearchHostsAdvancedArgs = { query?: string; startDate?: string };
type CreateHostArgs = Record<string, unknown>;
type UpdateHostArgs = { id: string; input: Record<string, unknown> };

export const hostsResolvers = {
  Query: {
    hosts: (): Host[] => getAllHosts.all() as Host[],
    searchHosts: (_parent: unknown, { query }: { query: string }): Host[] => {
      const searchTerm = `%${query}%`;
      return searchHosts.all(searchTerm, searchTerm) as Host[];
    },
    host: (_parent: unknown, { id }: { id: string }): Host | undefined => getHostById.get(id) as Host | undefined,
    searchHostsAdvanced: (_parent: unknown, args: SearchHostsAdvancedArgs): Host[] => {
      const searchTerm = args.query ? `%${args.query}%` : '%';
      if (args.startDate) {
        return searchHosts.all(searchTerm, searchTerm) as Host[];
      }
      if (args.query) return searchHosts.all(searchTerm, searchTerm) as Host[];
      return getAllHosts.all() as Host[];
    },
  },
  Mutation: {
    createHost: (_parent: unknown, args: CreateHostArgs, context: AuthContext): Host => {
      if (!context.user) throw new Error('Authentication required');
      try {
        const name = args.name as string;
        validateName(name);
        const userId = args.userId as string | undefined;
        if (!userId) throw new Error('User ID is required');
        if (userId !== context.user.id) throw new Error('Unauthorized: Can only create hosts for yourself');
        validateOptionalText(args.location as string | undefined, 'Location', 255);
        validateOptionalText(args.description as string | undefined, 'Description', 2000);
        validateOptionalText(args.address as string | undefined, 'Address', 255);
        validateOptionalText(args.city as string | undefined, 'City', 100);
        validateOptionalText(args.state as string | undefined, 'State', 100);
        validateOptionalText(args.zipCode as string | undefined, 'Zip code', 20);
        validateOptionalText(args.country as string | undefined, 'Country', 100);
        validateOptionalText(args.houseRules as string | undefined, 'House rules', 2000);
        validateCoordinates(args.latitude as number | undefined, args.longitude as number | undefined);
        validatePositiveInteger(args.maxGuests as number | undefined, 'Max guests', 50);
        validatePositiveInteger(args.bedrooms as number | undefined, 'Bedrooms', 20);
        validatePositiveInteger(args.bathrooms as number | undefined, 'Bathrooms', 20);
        if (args.amenities && !Array.isArray(args.amenities)) throw new Error('Amenities must be an array');
        if (args.photos && !Array.isArray(args.photos)) throw new Error('Photos must be an array');

        const newHostId = uuidv4();
        insertHost.run(
          newHostId,
          userId,
          name,
          args.location as string | undefined,
          args.description as string | undefined,
          args.address as string | undefined,
          args.city as string | undefined,
          args.state as string | undefined,
          args.zipCode as string | undefined,
          args.country as string | undefined,
          args.latitude as number | undefined,
          args.longitude as number | undefined,
          args.amenities ? JSON.stringify(args.amenities as unknown[]) : null,
          args.houseRules as string | undefined,
          args.checkInTime as string | undefined,
          args.checkOutTime as string | undefined,
          args.maxGuests as number | undefined,
          args.bedrooms as number | undefined,
          args.bathrooms as number | undefined,
          args.photos ? JSON.stringify(args.photos as unknown[]) : null
        );
        return {
          id: newHostId,
          user_id: userId,
          name,
          location: args.location as string | undefined,
          description: args.description as string | undefined,
          address: args.address as string | undefined,
          city: args.city as string | undefined,
          state: args.state as string | undefined,
          zip_code: args.zipCode as string | undefined,
          country: args.country as string | undefined,
          latitude: args.latitude as number | undefined,
          longitude: args.longitude as number | undefined,
          amenities: args.amenities ? JSON.stringify(args.amenities as unknown[]) : null,
          house_rules: args.houseRules as string | undefined,
          check_in_time: args.checkInTime as string | undefined,
          check_out_time: args.checkOutTime as string | undefined,
          max_guests: args.maxGuests as number | undefined,
          bedrooms: args.bedrooms as number | undefined,
          bathrooms: args.bathrooms as number | undefined,
          photos: args.photos ? JSON.stringify(args.photos as unknown[]) : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as unknown as Host;
      } catch (error) {
        const err = error as unknown as { code?: string };
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') throw new Error('A host with this information already exists');
        throw error;
      }
    },
    updateHost: (_parent: unknown, { id, input }: UpdateHostArgs, context: AuthContext): Host | undefined => {
      if (!context.user) throw new Error('Authentication required');
      const host = getHostById.get(id) as unknown as Record<string, unknown> | undefined;
      if (!host || (host.user_id as string | undefined) !== context.user.id) throw new Error('Unauthorized: Can only update your own hosts');
      try {
        if (input.name !== undefined) validateName(input.name as string);
        if (input.location !== undefined) validateOptionalText(input.location as string | undefined, 'Location', 255);
        if (input.description !== undefined) validateOptionalText(input.description as string | undefined, 'Description', 2000);
        if (input.address !== undefined) validateOptionalText(input.address as string | undefined, 'Address', 255);
        if (input.city !== undefined) validateOptionalText(input.city as string | undefined, 'City', 100);
        if (input.state !== undefined) validateOptionalText(input.state as string | undefined, 'State', 100);
        if (input.zipCode !== undefined) validateOptionalText(input.zipCode as string | undefined, 'Zip code', 20);
        if (input.country !== undefined) validateOptionalText(input.country as string | undefined, 'Country', 100);
        if (input.houseRules !== undefined) validateOptionalText(input.houseRules as string | undefined, 'House rules', 2000);
        if (input.latitude !== undefined || input.longitude !== undefined) validateCoordinates(input.latitude as number | undefined, input.longitude as number | undefined);
        if (input.maxGuests !== undefined) validatePositiveInteger(input.maxGuests as number | undefined, 'Max guests', 50);
        if (input.bedrooms !== undefined) validatePositiveInteger(input.bedrooms as number | undefined, 'Bedrooms', 20);
        if (input.bathrooms !== undefined) validatePositiveInteger(input.bathrooms as number | undefined, 'Bathrooms', 20);
        if (input.amenities !== undefined && !Array.isArray(input.amenities)) throw new Error('Amenities must be an array');
        if (input.photos !== undefined && !Array.isArray(input.photos)) throw new Error('Photos must be an array');
        if (input.availabilities !== undefined) {
          if (!Array.isArray(input.availabilities)) throw new Error('Availabilities must be an array');
          for (const availability of input.availabilities) {
            // reuse validators from validators module
            // minimal validation here to keep parity
            if (!availability.startDate || !availability.endDate) throw new Error('Start date and end date are required');
          }
        }

        const updates: string[] = [];
  const values: unknown[] = [];
        if (input.name !== undefined) { updates.push('name = ?'); values.push(input.name); }
        if (input.location !== undefined) { updates.push('location = ?'); values.push(input.location); }
        if (input.description !== undefined) { updates.push('description = ?'); values.push(input.description); }
        if (input.address !== undefined) { updates.push('address = ?'); values.push(input.address); }
        if (input.city !== undefined) { updates.push('city = ?'); values.push(input.city); }
        if (input.state !== undefined) { updates.push('state = ?'); values.push(input.state); }
        if (input.zipCode !== undefined) { updates.push('zip_code = ?'); values.push(input.zipCode); }
        if (input.country !== undefined) { updates.push('country = ?'); values.push(input.country); }
        if (input.latitude !== undefined) { updates.push('latitude = ?'); values.push(input.latitude); }
        if (input.longitude !== undefined) { updates.push('longitude = ?'); values.push(input.longitude); }
        if (input.amenities !== undefined) { updates.push('amenities = ?'); values.push(input.amenities ? JSON.stringify(input.amenities) : null); }
        if (input.houseRules !== undefined) { updates.push('house_rules = ?'); values.push(input.houseRules); }
        if (input.checkInTime !== undefined) { updates.push('check_in_time = ?'); values.push(input.checkInTime); }
        if (input.checkOutTime !== undefined) { updates.push('check_out_time = ?'); values.push(input.checkOutTime); }
        if (input.maxGuests !== undefined) { updates.push('max_guests = ?'); values.push(input.maxGuests); }
        if (input.bedrooms !== undefined) { updates.push('bedrooms = ?'); values.push(input.bedrooms); }
        if (input.bathrooms !== undefined) { updates.push('bathrooms = ?'); values.push(input.bathrooms); }
  if (input.photos !== undefined) {
          try {
            const existingHost = getHostById.get(id) as unknown as Record<string, unknown> | undefined;
            const existingPhotos = existingHost && existingHost.photos ? JSON.parse((existingHost.photos as string) || '[]') : [];
            const newPhotos = input.photos || [];
            const removed = existingPhotos.filter((p: string) => !newPhotos.includes(p));
            const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');
            for (const removedUrl of removed) {
              try {
                if (typeof removedUrl === 'string' && removedUrl.includes('/uploads/')) {
                  const fileName = path.basename(removedUrl);
                  const filePath = path.join(uploadsDir, fileName);
                  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }
              } catch (e) {
                console.error('Failed to delete removed photo file', removedUrl, e);
              }
            }
          } catch (e) {
            console.error('Error while cleaning up removed photos:', e);
          }
          updates.push('photos = ?');
          values.push(input.photos ? JSON.stringify(input.photos) : null);
        }

        if (updates.length === 0) return getHostById.get(id) as Host | undefined;

        const updateQuery = `UPDATE hosts SET ${updates.join(', ')} WHERE id = ?`;
        values.push(id);
        db.prepare(updateQuery).run(...values);

        if (input.availabilities !== undefined) {
          db.prepare('DELETE FROM availabilities WHERE host_id = ?').run(id);
          const insertAvailabilityStmt = db.prepare(`INSERT INTO availabilities (host_id, start_date, end_date, status, notes) VALUES (?, ?, ?, ?, ?)`);
          for (const availability of input.availabilities) {
            insertAvailabilityStmt.run(id, availability.startDate, availability.endDate, availability.status || 'available', availability.notes || null);
          }
        }

        return getHostById.get(id) as Host | undefined;
      } catch (error) {
        const err = error as unknown as { code?: string };
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') throw new Error('A host with this email already exists');
        throw error;
      }
    },
    deleteHost: (_parent: unknown, { id }: { id: string }, context: AuthContext) => {
      if (!context.user) throw new Error('Authentication required');
      const host = getHostById.get(id) as unknown as Record<string, unknown> | undefined;
      if (!host || (host.user_id as string | undefined) !== context.user.id) throw new Error('Unauthorized: Can only delete your own hosts');
      try {
        db.prepare('DELETE FROM availabilities WHERE host_id = ?').run(id);
        db.prepare('DELETE FROM booking_requests WHERE host_id = ?').run(id);
        const result = db.prepare('DELETE FROM hosts WHERE id = ?').run(id);
        return result.changes > 0;
      } catch (error) {
        console.error('error: ', error);
        return false;
      }
    },
  },
  Host: {
    name: (parent: Record<string, unknown>) => parent.name as string,
    createdAt: (parent: Record<string, unknown>) => (parent.created_at as string) || new Date().toISOString(),
    updatedAt: (parent: Record<string, unknown>) => (parent.updated_at as string) || new Date().toISOString(),
    user: (parent: Record<string, unknown>) => {
      if (parent.user_id) {
        const user = getUserById.get(parent.user_id as string);
        if (user) return user;
      }
      if (parent.email) {
        const user = getUserByEmail.get(parent.email as string);
        if (user) return user;
      }
      return { id: '1', name: parent.name as string, email: (parent.email as string) || 'unknown@example.com', createdAt: new Date().toISOString() };
    },
    availabilities: (parent: Record<string, unknown>) => {
      return getHostAvailabilities.all(parent.id as string);
    },
    userId: (parent: Host) => parent.user_id,
    zipCode: (parent: Host) => parent.zip_code,
    houseRules: (parent: Host) => parent.house_rules,
    checkInTime: (parent: Host) => parent.check_in_time,
    checkOutTime: (parent: Host) => parent.check_out_time,
    maxGuests: (parent: Host) => parent.max_guests,
    amenities: (parent: Host) => {
      if (!parent.amenities) return [];
      if (Array.isArray(parent.amenities)) return parent.amenities;
      if (typeof parent.amenities === 'string') {
        try { return JSON.parse(parent.amenities); } catch { return []; }
      }
      return [];
    },
    photos: (parent: Host) => {
      if (!parent.photos) return [];
      if (Array.isArray(parent.photos)) return parent.photos;
      if (typeof parent.photos === 'string') {
        try { return JSON.parse(parent.photos); } catch { return []; }
      }
      return [];
    },
  },
};

export default hostsResolvers;
