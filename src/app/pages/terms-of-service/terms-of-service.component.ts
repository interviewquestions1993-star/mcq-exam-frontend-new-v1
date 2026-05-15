import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  template: `
    <div class="terms-container">
      <div class="page-header">
        <button mat-raised-button color="primary" routerLink="/">
          <mat-icon>home</mat-icon>
          Back to Home
        </button>
      </div>
      <mat-card class="terms-card">
        <mat-card-header>
          <mat-card-title>Terms of Service</mat-card-title>
          <mat-card-subtitle>Last updated: May 9, 2026</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>These Terms of Service ("Terms") govern your use of MCQ Exam & Interview Preparer ("we", "us", or "our") website and services. By accessing or using our services, you agree to be bound by these Terms.</p>

          <h3>Acceptance of Terms</h3>
          <p>By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.</p>

          <h3>Description of Service</h3>
          <p>MCQ Exam & Interview Preparer provides AI-powered MCQ generation and interview preparation tools for educational purposes. Our services include:</p>
          <ul>
            <li>Generation of multiple-choice questions</li>
            <li>CBSE curriculum-based content</li>
            <li>Progress tracking and results</li>
            <li>Educational resources and tools</li>
          </ul>

          <h3>User Responsibilities</h3>
          <p>You agree to:</p>
          <ul>
            <li>Use the services for lawful purposes only</li>
            <li>Not attempt to reverse engineer or copy our content</li>
            <li>Not use automated tools to access our services</li>
            <li>Provide accurate information when required</li>
            <li>Respect intellectual property rights</li>
          </ul>

          <h3>Intellectual Property</h3>
          <p>All content, features, and functionality of our services are owned by MCQ Exam & Interview Preparer and are protected by copyright, trademark, and other intellectual property laws.</p>

          <h3>Disclaimer of Warranties</h3>
          <p>Our services are provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of the generated content.</p>

          <h3>Limitation of Liability</h3>
          <p>In no event shall MCQ Exam & Interview Preparer be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our services.</p>

          <h3>Privacy</h3>
          <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of our services.</p>

          <h3>Termination</h3>
          <p>We reserve the right to terminate or suspend your access to our services at our discretion, without prior notice, for any reason.</p>

          <h3>Changes to Terms</h3>
          <p>We may modify these Terms at any time. Continued use of our services after changes constitutes acceptance of the new Terms.</p>

          <h3>Governing Law</h3>
          <p>These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.</p>

          <h3>Contact Information</h3>
          <p>If you have questions about these Terms, please contact us at interviewquestions1993&#64;gmail.com.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./terms-of-service.component.css']
})
export class TermsOfServiceComponent {}