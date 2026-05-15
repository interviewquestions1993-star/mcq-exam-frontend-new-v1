import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cbse',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="cbse-container">
      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <button mat-icon-button class="back-button" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>CBSE Classes</h1>
          <p class="subtitle">Select your class to continue</p>
        </div>
      </div>

      <!-- Classes Grid -->
      <div class="classes-section">
        <div class="classes-grid">
          <mat-card
            *ngFor="let classInfo of classes"
            class="class-card"
            (click)="selectClass(classInfo.number)"
          >
            <mat-card-content>
              <div class="class-content">
                <div class="class-icon">{{ classInfo.icon }}</div>
                <h3>Class {{ classInfo.number }}</h3>
                <p>{{ classInfo.description }}</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./cbse.component.css']
})
export class CbseComponent {
  classes = [
    { number: 1, icon: '1️⃣', description: 'Foundation Year' },
    { number: 2, icon: '2️⃣', description: 'Building Basics' },
    { number: 3, icon: '3️⃣', description: 'Core Learning' },
    { number: 4, icon: '4️⃣', description: 'Advanced Basics' },
    { number: 5, icon: '5️⃣', description: 'Primary Level' },
    { number: 6, icon: '6️⃣', description: 'Middle School' },
    { number: 7, icon: '7️⃣', description: 'Pre-Secondary' },
    { number: 8, icon: '8️⃣', description: 'Secondary Prep' },
    { number: 9, icon: '9️⃣', description: 'High School' },
    { number: 10, icon: '🔟', description: 'Board Exams' },
    { number: 11, icon: '1️⃣1️⃣', description: 'Senior Secondary' },
    { number: 12, icon: '1️⃣2️⃣', description: 'Final Year' }
  ];

  constructor(private router: Router) {}

  selectClass(classNumber: number) {
    this.router.navigate(['/cbse', classNumber, 'subjects']);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}