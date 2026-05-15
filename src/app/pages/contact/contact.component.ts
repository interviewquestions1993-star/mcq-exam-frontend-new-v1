import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  template: `
    <div class="contact-container">
      <div class="page-header">
        <button mat-raised-button color="primary" routerLink="/">
          <mat-icon>home</mat-icon>
          Back to Home
        </button>
      </div>
      <mat-card class="contact-card">
        <mat-card-header>
          <mat-card-title>Contact Us</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>We'd love to hear from you! Whether you have questions, feedback, or need support, feel free to reach out.</p>

          <div class="contact-info">
            <div class="contact-item">
              <mat-icon>email</mat-icon>
              <div>
                <h4>Email</h4>
                <p>interviewquestions1993&#64;gmail.com</p>
              </div>
            </div>

            <div class="contact-item">
              <mat-icon>web</mat-icon>
              <div>
                <h4>Website</h4>
                <p>www.ai-mcq-trainer.in</p>
              </div>
            </div>

            <div class="contact-item">
              <mat-icon>location_on</mat-icon>
              <div>
                <h4>Address</h4>
                <p>MCQ Exam & Interview Preparer<br>
                Online Platform<br>
                Global</p>
              </div>
            </div>
          </div>

          <div class="contact-form-note">
            <p><strong>Note:</strong> For technical support or feature requests, please email us directly. We aim to respond within 24-48 hours.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {}