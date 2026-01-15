import { Injectable } from '@angular/core';
import { LoginRequest, AuthResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = 'http://localhost:8080';

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const resp = await fetch(`${this.base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || `Login failed: ${resp.status}`);
    }

    const data = await resp.json();
    if (data?.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data as AuthResponse;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  logout(): void {
    localStorage.removeItem('auth_token');
  }
}
