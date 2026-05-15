import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a routerLink="/" class="logo-container">
      <svg class="logo-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <!-- Background circle -->
        <circle cx="60" cy="60" r="58" fill="rgba(255,255,255,0.1)" stroke="white" stroke-width="2"/>
        
        <!-- Book icon (left) -->
        <path d="M35 40 L35 85 Q35 90 40 90 L50 90 Q55 90 55 85 L55 40 Q55 35 50 35 L40 35 Q35 35 35 40 Z" 
              fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="50" y1="40" x2="50" y2="85" stroke="white" stroke-width="1.5"/>
        
        <!-- Checkmark (right) -->
        <path d="M70 60 L75 67 L85 50" 
              fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        
        <!-- Lightbulb indicator (top) -->
        <circle cx="60" cy="25" r="3" fill="#FFD700"/>
      </svg>
      <div class="logo-text">
        <div class="logo-title">MCQ Prep</div>
        <div class="logo-subtitle">Master Exams</div>
      </div>
    </a>
  `,
  styleUrls: ['./logo.component.css']
})
export class LogoComponent {}
