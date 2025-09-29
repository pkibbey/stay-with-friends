import type { AuthContext } from '../context';
import { getUserByEmail, getUserById, insertUser, updateUser } from '../../db';
import { User } from '@stay-with-friends/shared-types';
import { validateEmail } from '../validators';

export const usersResolvers = {
  Query: {
    user: (_parent: unknown, { email }: { email: string }, context: AuthContext) => {
      if (!context.user) throw new Error('Authentication required');
      const row = getUserByEmail.get(email) as unknown;
      return row as User | undefined;
    },
  },
  Mutation: {
    createUser: (_parent: unknown, { email, name, image }: { email: string, name?: string, image?: string }, context: AuthContext): User => {
      if (!context.user) throw new Error('Authentication required');
      const userId = context.user.id;
      insertUser.run(userId, email, name, null, image);
      const created: User = { id: userId, email, name, image, created_at: new Date().toISOString() } as User;
      return created;
    },
    updateUser: (_parent: unknown, { id, name, image }: { id: string, name?: string, image?: string }, context: AuthContext): User => {
      if (!context.user) throw new Error('Authentication required');
      if (context.user.id !== id) {
        try {
          const targetUser = getUserById.get(id) as unknown as Record<string, unknown> | undefined;
          const authenticatedEmail = context.user.email || '';
          if (!targetUser || !authenticatedEmail || (targetUser.email as string | undefined) !== authenticatedEmail) throw new Error('Unauthorized: Can only update your own profile');
        } catch {
          throw new Error('Unauthorized: Can only update your own profile');
        }
      }
      updateUser.run(name, image, id);
      return getUserById.get(id) as User;
    },
    checkEmailExists: (_parent: unknown, { email }: { email: string }) => {
      validateEmail(email);
      const user = getUserByEmail.get(email) as unknown;
      return !!user;
    },
  },
  User: {
    emailVerified: (parent: User) => parent.email_verified,
    createdAt: (parent: User) => parent.created_at,
  },
};

export default usersResolvers;
