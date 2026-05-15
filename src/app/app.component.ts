import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SeoService } from './services/seo.service';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatIconModule],
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
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService
  ) {}

  ngOnInit() {
    // Handle route changes for analytics and SEO
    this.router.events
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
