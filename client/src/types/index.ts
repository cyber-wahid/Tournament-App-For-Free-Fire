export interface AuthUser {
  id: string;
  username: string;
  email: string;
  balance: string;
}

export interface AuthAdmin {
  id: string;
  username: string;
  email: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  admin: AuthAdmin | null;
  token: string | null;
  login: (credentials: any, type: 'user' | 'admin') => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  validateToken: () => Promise<boolean>;
  isLoading: boolean;
  userType: 'user' | 'admin' | null;
}
