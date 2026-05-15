import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  template: `
    <div class="about-container">
      <div class="page-header">
        <button mat-raised-button color="primary" routerLink="/">
          <mat-icon>home</mat-icon>
          Back to Home
        </button>
      </div>
      <mat-card class="about-card">
        <mat-card-header>
          <mat-card-title>About MCQ Exam & Interview Preparer</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Welcome to MCQ Exam & Interview Preparer, your comprehensive platform for mastering Multiple Choice Questions (MCQs) and preparing for interviews.</p>

          <h3>Our Mission</h3>
          <p>Our mission is to provide students and professionals with high-quality, AI-powered MCQ generation and interview preparation tools that help them excel in their academic and career pursuits.</p>

          <h3>What We Offer</h3>
          <ul>
            <li><strong>AI-Generated MCQs:</strong> Our advanced AI system creates customized multiple-choice questions based on your selected topics.</li>
            <li><strong>Comprehensive Coverage:</strong> From basic concepts to advanced topics in computer science and applications.</li>
            <li><strong>CBSE Integration:</strong> Specialized preparation for CBSE curriculum across different classes and subjects.</li>
            <li><strong>Interview Preparation:</strong> Practice questions and scenarios to help you prepare for technical interviews.</li>
            <li><strong>Progress Tracking:</strong> Monitor your performance and identify areas for improvement.</li>
          </ul>

          <h3>Technology Stack</h3>
          <p>Built with modern web technologies including Angular for the frontend and Python-based AI services for content generation.</p>

          <h3>Contact Us</h3>
          <p>If you have any questions, suggestions, or need support, please visit our <a routerLink="/contact">Contact page</a>.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./about.component.css']
})
export class AboutComponent {}