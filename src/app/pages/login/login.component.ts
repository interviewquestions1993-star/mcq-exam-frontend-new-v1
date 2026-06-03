import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OAUTH2_CONFIG } from '../../config/oauth.config';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Welcome to MCQ Exam Preparer</h1>
          <p>Sign in with your Google account to get started</p>
        </div>

        <div class="login-content">
          <div id="google_signin_button" class="google-signin-button"></div>
          
          <div class="divider">
            <span>or</span>
          </div>

          <p class="login-info">
            Sign in to track your progress, save your MCQs, and access personalized recommendations.
          </p>

          <div class="features">
            <div class="feature">
              <span class="feature-icon">✓</span>
              <span>Track your quiz progress</span>
            </div>
            <div class="feature">
              <span class="feature-icon">✓</span>
              <span>Save your favorite MCQs</span>
            </div>
            <div class="feature">
              <span class="feature-icon">✓</span>
              <span>Get personalized recommendations</span>
            </div>
            <div class="feature">
              <span class="feature-icon">✓</span>
              <span>Access your exam history</span>
            </div>
          </div>
        </div>

        <div class="login-footer">
          <p>Don't have a Google account? <a href="https://accounts.google.com/signup" target="_blank">Create one for free</a></p>
        </div>

        <div *ngIf="isLoading" class="loading-spinner">
          <div class="spinner"></div>
          <p>Signing in...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 200px);
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-width: 500px;
      width: 100%;
      padding: 40px;
      position: relative;
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .login-header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      color: #333;
      font-weight: 600;
    }

    .login-header p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .login-content {
      margin-bottom: 30px;
    }

    .google-signin-button {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    .divider {
      display: flex;
      align-items: center;
      margin: 25px 0;
      color: #999;
      font-size: 14px;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #ddd;
    }

    .divider span {
      padding: 0 15px;
      font-weight: 500;
    }

    .login-info {
      text-align: center;
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .features {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }

    .feature {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      font-size: 14px;
      color: #333;
    }

    .feature:last-child {
      margin-bottom: 0;
    }

    .feature-icon {
      color: #4CAF50;
      font-weight: bold;
      margin-right: 10px;
      font-size: 16px;
    }

    .login-footer {
      text-align: center;
      font-size: 13px;
      color: #666;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .login-footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .login-footer a:hover {
      text-decoration: underline;
    }

    .loading-spinner {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin-bottom: 15px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-spinner p {
      color: #667eea;
      font-weight: 500;
    }

    @media (max-width: 600px) {
      .login-card {
        padding: 30px 20px;
      }

      .login-header h1 {
        font-size: 24px;
      }

      .features {
        padding: 15px;
      }

      .feature {
        font-size: 13px;
      }
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;
  private destroy$ = new Subject<void>();
  private returnUrl = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get return URL from route parameters or default to '/'
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.returnUrl = params['returnUrl'] || '/';
    });

    // If already authenticated, redirect to home or return URL
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    // Initialize Google Sign-In button
    this.initializeGoogleSignIn();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeGoogleSignIn(): void {
    // Wait for Google API to be loaded
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.renderGoogleSignInButton();
    };
    document.head.appendChild(script);
  }

  private renderGoogleSignInButton(): void {
    if ((window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: OAUTH2_CONFIG.GOOGLE_CLIENT_ID,
        callback: (response: any) => this.handleGoogleSignIn(response),
        auto_select: false
      });

      (window as any).google.accounts.id.renderButton(
        document.getElementById('google_signin_button'),
        {
          theme: 'outline',
          size: 'large',
          width: '300'
        }
      );
    }
  }

  private handleGoogleSignIn(response: any): void {
    this.isLoading = true;
    
    try {
      // Call the auth service to handle login
      this.authService.login(response);
      
      // Redirect to return URL or home
      setTimeout(() => {
        this.router.navigateByUrl(this.returnUrl);
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      this.isLoading = false;
    }
  }
}
