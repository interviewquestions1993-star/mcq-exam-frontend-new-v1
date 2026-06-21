import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from './services/theme.service';
import { CommonModule } from '@angular/common';
import { SeoService } from './services/seo.service';
import { AuthService, AuthUser } from './services/auth.service';
import { Observable, Subscription } from 'rxjs';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatIconModule, CommonModule],
  template: `
    <header class="app-header">
      <div class="toolbar-container">
        <a class="logo" routerLink="/">🎓 MCQ Exam & Interview Preparer</a>
        <nav class="main-nav">
          <a routerLink="/about" class="nav-link about-link">
            <mat-icon>info</mat-icon>
            About
          </a>
          <a routerLink="/contact" class="nav-link contact-link">
            <mat-icon>contact_mail</mat-icon>
            Contact
          </a>
          <div *ngIf="(isAuthenticated$ | async) as isAuth" class="auth-section" [class.authenticated]="isAuth">
            <div class="user-profile" *ngIf="currentUser$ | async as user">
              <img [src]="user.picture" [alt]="user.name" class="user-avatar" [title]="user.name">
              <span class="user-name">{{ user.name }}</span>
              <button (click)="logout()" class="logout-btn" title="Logout">
                <mat-icon>logout</mat-icon>
              </button>
            </div>
            <a *ngIf="!isAuth" routerLink="/login" class="login-btn">
              <mat-icon>login</mat-icon>
              Login
            </a>
          </div>
          <a *ngIf="!(isAuthenticated$ | async)" routerLink="/login" class="login-link">
            <mat-icon>login</mat-icon>
            Login
          </a>
          <button class="theme-toggle" (click)="toggleTheme()" [title]="(theme === 'dark' ? 'Switch to light' : 'Switch to dark')">
            <mat-icon *ngIf="theme === 'dark'">dark_mode</mat-icon>
            <mat-icon *ngIf="theme !== 'dark'">light_mode</mat-icon>
          </button>
        </nav>
      </div>
    </header>
    <div class="main-content">
      <router-outlet></router-outlet>
    </div>
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-links">
          <a routerLink="/about">
            <mat-icon>info</mat-icon>
            About
          </a>
          <a routerLink="/contact">
            <mat-icon>contact_mail</mat-icon>
            Contact
          </a>
          <a routerLink="/privacy-policy">
            <mat-icon>privacy_tip</mat-icon>
            Privacy Policy
          </a>
          <a routerLink="/terms-of-service">
            <mat-icon>gavel</mat-icon>
            Terms of Service
          </a>
        </div>
        <div class="footer-copyright">
          <p>&copy; 2026 MCQ Exam & Interview Preparer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  currentUser$: Observable<AuthUser | null>;
  isAuthenticated$: Observable<boolean>;
  theme: string = 'light';
  private activityEvents = ['mousemove', 'keydown', 'scroll', 'touchstart'];
  private activityTimeoutMs = 3 * 60 * 60 * 1000; // 3 hours
  private activityTimerId: any;
  private routerSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
    private authService: AuthService
    , private themeService: ThemeService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.themeService.theme$.subscribe(t => this.theme = t);
  }

  ngOnInit() {
    this.setupIdleTimeout();

    // Handle route changes for analytics and SEO
    this.routerSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data)
      )
      .subscribe((data: any) => {
        // Update SEO meta tags based on route data
        this.updateSeoForRoute(this.router.url, data);
      });

    // Google Analytics tracking
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        gtag('config', 'G-Q3VBZ7SE3S', {
          page_path: event.urlAfterRedirects
        });
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.teardownIdleTimeout();
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
    }
  }

  private setupIdleTimeout(): void {
    this.refreshActivityTimer();

    for (const eventName of this.activityEvents) {
      window.addEventListener(eventName, this.onUserActivity, true);
    }
  }

  private teardownIdleTimeout(): void {
    if (this.activityTimerId) {
      clearTimeout(this.activityTimerId);
      this.activityTimerId = null;
    }

    for (const eventName of this.activityEvents) {
      window.removeEventListener(eventName, this.onUserActivity, true);
    }
  }

  private onUserActivity = (): void => {
    if (this.authService.isAuthenticated()) {
      if (this.authService.isSessionExpired()) {
        this.authService.logout();
        this.router.navigate(['/login']);
      } else {
        this.authService.refreshSession();
        this.refreshActivityTimer();
      }
    }
  };

  private refreshActivityTimer(): void {
    if (this.activityTimerId) {
      clearTimeout(this.activityTimerId);
    }

    this.activityTimerId = setTimeout(() => {
      if (this.authService.isAuthenticated()) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    }, this.activityTimeoutMs);
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  private updateSeoForRoute(url: string, routeData: any) {
    // Extract parameters from URL
    const urlSegments = url.split('/').filter(segment => segment);

    if (url === '/' || url === '') {
      this.seoService.updateMetaTags(this.seoService.getHomePageMeta());
    } else if (url.startsWith('/quiz/')) {
      const topic = urlSegments[1];
      this.seoService.updateMetaTags(this.seoService.getQuizPageMeta(topic));
    } else if (url.startsWith('/cbse')) {
      if (urlSegments.length === 1) {
        this.seoService.updateMetaTags(this.seoService.getCbsePageMeta());
      } else if (urlSegments.length === 3 && urlSegments[2] === 'subjects') {
        const classNumber = urlSegments[1];
        this.seoService.updateMetaTags(this.seoService.getCbsePageMeta(classNumber));
      } else if (urlSegments.length === 5 && urlSegments[4] === 'chapters') {
        const classNumber = urlSegments[1];
        const subject = urlSegments[3];
        this.seoService.updateMetaTags(this.seoService.getCbsePageMeta(classNumber, subject));
      }
    } else if (url === '/about') {
      this.seoService.updateMetaTags(this.seoService.getAboutPageMeta());
    } else if (url === '/contact') {
      this.seoService.updateMetaTags(this.seoService.getContactPageMeta());
    } else {
      // Default meta tags for other pages
      this.seoService.updateMetaTags(this.seoService.getHomePageMeta());
    }
  }
}
