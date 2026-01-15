export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresIn?: number;
  user?: Record<string, any>;
}
