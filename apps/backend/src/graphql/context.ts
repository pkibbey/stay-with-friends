export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface AuthContext {
  user?: AuthUser;
}

export default {};
