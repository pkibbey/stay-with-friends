import type { AuthContext } from '../context';
import { getConnections, getConnectionRequests, insertConnection, getUserByEmail, db, getConnectionById, deleteConnectionsBetweenUsers, getUserById } from '../../db';
import { Connection } from '@stay-with-friends/shared-types';
import { validateEmail, validateOptionalText, validateUUID, validateStatus } from '../validators';
import { v4 as uuidv4 } from 'uuid';

export const connectionsResolvers = {
  Query: {
    connections: (_parent: unknown, { userId }: { userId: string }, context: AuthContext): Connection[] => {
      if (!context.user) throw new Error('Authentication required');
      if (context.user.id !== userId) throw new Error('Unauthorized: Can only view your own connections');
      return getConnections.all(userId, userId, userId) as Connection[];
    },
    connectionRequests: (_parent: unknown, { userId }: { userId: string }, context: AuthContext): Connection[] => {
      if (!context.user) throw new Error('Authentication required');
      if (context.user.id !== userId) throw new Error('Unauthorized: Can only view your own connection requests');
      return getConnectionRequests.all(userId) as Connection[];
    },
  },
  Mutation: {
    createConnection: (_parent: unknown, { userId, connectedUserEmail, relationship }: { userId: string, connectedUserEmail: string, relationship?: string }, context: AuthContext): Connection => {
      if (!context.user) throw new Error('Authentication required');
      if (context.user.id !== userId) throw new Error('Unauthorized: Can only create connections for yourself');
      if (!userId) throw new Error('User ID is required');
      validateEmail(connectedUserEmail);
      validateOptionalText(relationship, 'Relationship', 50);
  const connectedUser = getUserByEmail.get(connectedUserEmail) as unknown as Record<string, unknown> | undefined;
  if (!connectedUser || !connectedUser.id) throw new Error('User with this email not found');
  const newConnectionId = uuidv4();
  insertConnection.run(newConnectionId, userId, connectedUser.id, relationship, 'pending');
  return { id: newConnectionId, user_id: userId, connected_user_id: connectedUser.id as string, relationship, status: 'pending', created_at: new Date().toISOString() } as Connection;
    },
    updateConnectionStatus: (_parent: unknown, { connectionId, status }: { connectionId: string, status: string }, context: AuthContext): Connection | undefined => {
      if (!context.user) throw new Error('Authentication required');
      validateUUID(connectionId, 'Connection ID');
      validateStatus(status, ['pending', 'accepted', 'declined', 'cancelled']);
      const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId) as unknown as Record<string, unknown> | undefined;
      if (!connection) throw new Error('Connection not found');
      if ((connection.user_id as string) !== context.user.id && (connection.connected_user_id as string) !== context.user.id) throw new Error('Unauthorized: Can only update connections you are part of');
      db.prepare('UPDATE connections SET status = ? WHERE id = ?').run(status, connectionId);
      const updatedConnection = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId);
      return updatedConnection as Connection | undefined;
    },
    deleteConnection: (_parent: unknown, { connectionId }: { connectionId: string }, context: AuthContext) => {
      if (!context.user) throw new Error('Authentication required');
      validateUUID(connectionId, 'Connection ID');
      const connRow = getConnectionById.get(connectionId) as unknown as Record<string, unknown> | undefined;
      if (!connRow) throw new Error('Connection not found');
      if ((connRow.user_id as string) !== context.user.id && (connRow.connected_user_id as string) !== context.user.id) throw new Error('Unauthorized: Can only delete connections you are part of');
      if (connRow.status !== 'accepted') throw new Error('Only accepted connections can be removed via this operation');
      try {
        const result = deleteConnectionsBetweenUsers.run(connRow.user_id, connRow.connected_user_id, connRow.user_id, connRow.connected_user_id) as { changes: number };
        if (result.changes === 0) {
          deleteConnectionsBetweenUsers.run(connRow.connected_user_id, connRow.user_id, connRow.connected_user_id, connRow.user_id);
        }
        return true;
      } catch (e) {
        console.error('Failed to delete connection', e);
        return false;
      }
    },
  },
  Connection: {
    connectedUser: (parent: Connection) => {
      return getUserById.get(parent.connected_user_id);
    },
    createdAt: (parent: Connection) => parent.created_at,
    userId: (parent: Connection) => parent.user_id,
    connectedUserId: (parent: Connection) => parent.connected_user_id,
  },
};

export default connectionsResolvers;
