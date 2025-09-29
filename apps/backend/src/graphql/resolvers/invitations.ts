import type { AuthContext } from '../context';
import Crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getUserByEmail, insertInvitation, getInvitationByEmail, insertConnection, getConnectionBetweenUsers, getInvitationByToken, updateInvitationStatus, getUserById, insertUser, getInvitationById, deleteInvitation, getInvitationsByInviter } from '../../db';
import { Invitation } from '@stay-with-friends/shared-types';
import { validateEmail, validateOptionalText, validateName, validateUUID } from '../validators';

export const invitationsResolvers = {
  Query: {
    invitation: (_parent: unknown, { token }: { token: string }): Invitation | undefined => {
      return getInvitationByToken.get(token) as Invitation | undefined;
    },
    invitations: (_parent: unknown, { inviterId }: { inviterId: string }, context: AuthContext): Invitation[] => {
      if (!context.user) throw new Error('Authentication required');
      if (context.user.id !== inviterId) throw new Error('Unauthorized: Can only view your own invitations');
      return getInvitationsByInviter.all(inviterId) as Invitation[];
    },
  },
  Mutation: {
    createInvitation: (_parent: unknown, { inviterId, inviteeEmail, message }: { inviterId: string, inviteeEmail: string, message?: string }, context: AuthContext): Invitation => {
      if (!context.user) throw new Error('Authentication required');
      if (context.user.id !== inviterId) throw new Error('Unauthorized: Can only create invitations for yourself');
      if (!inviterId) throw new Error('Inviter ID is required');
      validateEmail(inviteeEmail);
      validateOptionalText(message, 'Invitation message', 500);
      const existingUser = getUserByEmail.get(inviteeEmail) as unknown as Record<string, unknown> | undefined;
      if (existingUser) {
        const existingConnection = getConnectionBetweenUsers.get(inviterId, existingUser.id, existingUser.id, inviterId);
        if (existingConnection) throw new Error('Users are already connected or have a pending connection');
        const newConnId = uuidv4();
        insertConnection.run(newConnId, inviterId, existingUser.id as string, 'friend', 'pending');
        return { id: newConnId, inviter_id: inviterId, invitee_email: inviteeEmail, message: message || `Connection request sent to ${(existingUser.name as string) || inviteeEmail}`, token: 'connection-request', status: 'connection-sent', expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString() } as Invitation;
      }
      const existingInvitation = getInvitationByEmail.get(inviteeEmail);
      if (existingInvitation) throw new Error('Invitation already sent to this email');
      const token = Crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + 30);
      const newInvitationId = uuidv4();
      insertInvitation.run(newInvitationId, inviterId, inviteeEmail, message, token, expiresAt.toISOString());
      const invitation = { inviter_id: String(inviterId), invitee_email: inviteeEmail, message, token, status: 'pending', expires_at: expiresAt.toISOString(), created_at: new Date().toISOString() } as Invitation;
      return invitation;
    },
    acceptInvitation: (_parent: unknown, { token, userData }: { token: string, userData: Record<string, unknown> }, context: AuthContext) => {
      if (!context.user) throw new Error('Authentication required');
      if (!token || typeof token !== 'string') throw new Error('Invalid token format');
      if (userData.name) validateName(userData.name as string);
      validateOptionalText(userData.image as string | undefined, 'Image URL', 255);
      const invitation = getInvitationByToken.get(token) as unknown as Record<string, unknown> | undefined;
      if (!invitation) throw new Error('Invalid invitation token');
      if ((invitation.status as string) !== 'pending') throw new Error('Invitation has already been used or cancelled');
      if (new Date(invitation.expires_at as string) < new Date()) throw new Error('Invitation has expired');
      if (context.user.email !== (invitation.invitee_email as string)) throw new Error('Unauthorized: Can only accept invitations sent to your email');
      const existingUser = getUserByEmail.get(invitation.invitee_email as string) as unknown as Record<string, unknown> | undefined;
      if (existingUser) {
        const existingConnection = getConnectionBetweenUsers.get(invitation.inviter_id as string, existingUser.id as string, existingUser.id as string, invitation.inviter_id as string);
        if (existingConnection) throw new Error('Users are already connected or have a pending connection');
        insertConnection.run(invitation.inviter_id as string, existingUser.id as string, 'friend', 'pending');
        updateInvitationStatus.run('accepted', new Date().toISOString(), invitation.id as string);
        return existingUser;
      }
      const newUserId = context.user.id;
      insertUser.run(newUserId, invitation.invitee_email as string, userData.name as string | undefined, new Date().toISOString(), userData.image as string | undefined);
      updateInvitationStatus.run('accepted', new Date().toISOString(), invitation.id as string);
      insertConnection.run(invitation.inviter_id as string, newUserId, 'friend', 'accepted');
      insertConnection.run(newUserId, invitation.inviter_id as string, 'friend', 'accepted');
      const userRow = getUserById.get(newUserId);
      return userRow;
    },
    cancelInvitation: (_parent: unknown, { invitationId }: { invitationId: string }, context: AuthContext) => {
      if (!context.user) throw new Error('Authentication required');
      validateUUID(invitationId, 'Invitation ID');
      const invitation = getInvitationById.get(invitationId) as unknown as Record<string, unknown> | undefined;
      if (!invitation) throw new Error('Invitation not found');
      if ((invitation.inviter_id as string) !== context.user.id) throw new Error('Unauthorized: Can only cancel your own invitations');
      const result = updateInvitationStatus.run('cancelled', null, invitationId) as { changes: number };
      return result.changes > 0;
    },
    deleteInvitation: (_parent: unknown, { invitationId }: { invitationId: string }, context: AuthContext) => {
      if (!context.user) throw new Error('Authentication required');
      validateUUID(invitationId, 'Invitation ID');
      const invitation = getInvitationById.get(invitationId) as unknown as Record<string, unknown> | undefined;
      if (!invitation) throw new Error('Invitation not found');
      if ((invitation.inviter_id as string) !== context.user.id) throw new Error('Unauthorized: Can only delete your own invitations');
      if ((invitation.status as string) !== 'pending' && (invitation.status as string) !== 'cancelled') throw new Error('Only pending or cancelled invitations can be deleted');
      const result = deleteInvitation.run(invitationId) as { changes: number };
      return result.changes > 0;
    },
    sendInvitationEmail: (_parent: unknown, { email, invitationUrl }: { email: string, invitationUrl: string }) => {
      validateEmail(email);
      if (!invitationUrl || typeof invitationUrl !== 'string') throw new Error('Invitation URL is required');
      return invitationUrl;
    },
  },
  Invitation: {
    inviterId: (parent: Invitation) => parent.inviter_id,
    inviteeEmail: (parent: Invitation) => parent.invitee_email,
    expiresAt: (parent: Invitation) => parent.expires_at,
    acceptedAt: (parent: Invitation) => parent.accepted_at,
    createdAt: (parent: Invitation) => parent.created_at,
    inviter: (parent: Invitation) => {
      return getUserById.get(parent.inviter_id);
    },
  },
};

export default invitationsResolvers;
