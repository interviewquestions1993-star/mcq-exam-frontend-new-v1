import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  template: `
    <div class="privacy-container">
      <div class="page-header">
        <button mat-raised-button color="primary" routerLink="/">
          <mat-icon>home</mat-icon>
          Back to Home
        </button>
      </div>
      <mat-card class="privacy-card">
        <mat-card-header>
          <mat-card-title>Privacy Policy</mat-card-title>
          <mat-card-subtitle>Last updated: May 9, 2026</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>This Privacy Policy describes how MCQ Exam & Interview Preparer ("we", "us", or "our") collects, uses, and protects your information when you use our website and services.</p>

          <h3>Information We Collect</h3>
          <h4>Personal Information</h4>
          <p>We may collect personal information that you provide directly to us, such as:</p>
          <ul>
            <li>Name and email address when you contact us</li>
            <li>Usage data and preferences</li>
          </ul>

          <h4>Automatically Collected Information</h4>
          <p>When you use our website, we automatically collect certain information, including:</p>
          <ul>
            <li>IP address and location information</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent on our site</li>
            <li>Device information</li>
          </ul>

          <h3>How We Use Your Information</h3>
          <p>We use the collected information to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Improve user experience</li>
            <li>Analyze usage patterns</li>
            <li>Communicate with you about our services</li>
            <li>Ensure security and prevent fraud</li>
          </ul>

          <h3>Cookies and Tracking Technologies</h3>
          <p>We use cookies and similar technologies to enhance your experience. This includes:</p>
          <ul>
            <li>Google Analytics for website analytics</li>
            <li>Essential cookies for site functionality</li>
          </ul>
          <p>You can control cookie preferences through your browser settings.</p>

          <h3>Data Sharing and Disclosure</h3>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties, except:</p>
          <ul>
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
          </ul>

          <h3>Data Security</h3>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

          <h3>Your Rights</h3>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>

          <h3>Changes to This Privacy Policy</h3>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>

          <h3>Contact Us</h3>
          <p>If you have any questions about this Privacy Policy, please contact us at interviewquestions1993&#64;gmail.com.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent {}