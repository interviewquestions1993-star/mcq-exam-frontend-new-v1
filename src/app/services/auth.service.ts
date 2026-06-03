import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$: Observable<AuthUser | null> = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  private tokenKey = 'google_auth_token';
  private userKey = 'google_auth_user';

  constructor() {
    this.restoreAuth();
  }

  /**
   * Handle Google OAuth login response
   */
  login(response: any): void {
    try {
      // Decode the JWT token to get user info
      const payload = this.parseJwt(response.credential);
      
      const user: AuthUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        accessToken: response.credential
      };

      // Store user info and token
      localStorage.setItem(this.tokenKey, response.credential);
      localStorage.setItem(this.userKey, JSON.stringify(user));

      // Update observables
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } catch (error) {
      console.error('Error during login:', error);
      this.logout();
    }
  }

  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    // Clear Google session if available
    if ((window as any).google) {
      (window as any).google.accounts.id.disableAutoSelect();
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Restore authentication from localStorage
   */
  private restoreAuth(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userStr = localStorage.getItem(this.userKey);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        console.error('Error restoring auth:', error);
        this.logout();
      }
    }
  }

  /**
   * Parse JWT token to extract payload
   */
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      throw error;
    }
  }
}
