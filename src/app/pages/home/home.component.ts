import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <h1 class="hero-title">CBSE Grade 8 Practice</h1>
        <p class="hero-subtitle">Master CBSE Grade 8 with AI-Generated Questions</p>
      </div>

      <!-- CBSE Grade 8 CTA -->
      <div class="cbse-cta-section">
        <h2>Start Your CBSE Grade 8 Quiz</h2>
        <p>Select your subject and chapter to begin practicing with AI-generated questions.</p>
        <button
          mat-raised-button
          color="primary"
          class="cta-button"
          (click)="startCBSEGrade8()"
        >
          📚 Select Subject & Chapter
        </button>
      </div>

      <!-- CBSE Grade 8 Subjects -->
      <ng-template #subjectsDeferred @defer>
        <div class="subjects-section">
          <h2>CBSE Grade 8 Subjects</h2>
          <div class="topics-grid">
            <div
              *ngFor="let subject of cbseGrade8Subjects"
              class="topic-card"
              (click)="navigateToCBSESubject(subject)"
            >
              <div class="topic-icon">{{ subject.icon }}</div>
              <h3>{{ subject.name }}</h3>
              <p class="difficulty">{{ subject.chapters }} chapters</p>
            </div>
          </div>
        </div>
      </ng-template>

      <ng-container *ngIf="showTopics; else subjectsPlaceholder">
        <ng-container *ngTemplateOutlet="subjectsDeferred"></ng-container>
      </ng-container>

      <ng-template #subjectsPlaceholder>
        <div class="subjects-section subjects-placeholder">
          <h2>CBSE Grade 8 Subjects</h2>
          <div class="topics-grid">
            <div class="topic-card placeholder" *ngFor="let _ of placeholderTopics">
              <div class="topic-icon"></div>
              <h3></h3>
              <p class="difficulty"></p>
            </div>
          </div>
        </div>
      </ng-template>

      <!-- Features Section -->
      <div class="features-section">
        <h2>Why Choose Us?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>AI-Generated</h3>
            <p>Unique questions generated on-the-fly for unlimited practice</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎓</div>
            <h3>Smart Learning</h3>
            <p>Learn from detailed explanations after each question</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📈</div>
            <h3>Track Progress</h3>
            <p>Monitor your improvement across different topics</p>
          </div>
        </div>
      </div>

      <!-- View Persisted MCQs Section -->
      <div class="persisted-mcqs-section">
        <div class="persisted-card">
          <div class="persisted-icon">📚</div>
          <h3>Your MCQ Library</h3>
          <p>View all the MCQ questions you've generated and saved</p>
          <button mat-raised-button color="accent" (click)="viewPersistedMCQs()">
            📖 View My Library
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  showTopics = false;
  placeholderTopics = Array(8);

  cbseGrade8Subjects = [
    { name: 'Science', icon: '🔬', chapters: 13, id: 'science' },
    { name: 'Mathematics', icon: '🔢', chapters: 14, id: 'mathematics' },
    { name: 'English', icon: '📖', chapters: 15, id: 'english' },
    { name: 'Computer Science', icon: '💻', chapters: 11, id: 'computer-science' },
    { name: 'Hindi', icon: '🗣️', chapters: 10, id: 'hindi' },
    { name: 'Social Studies', icon: '🌍', chapters: 7, id: 'social-studies' }
  ];

  // Security: List of banned words to prevent inappropriate content
  private bannedWords = [
    'sex', 'adult', 'porn', 'nude', 'naked', 'erotic', 'xxx', 'nsfw',
    'fuck', 'shit', 'damn', 'bitch', 'asshole', 'cunt', 'dick', 'pussy',
    'rape', 'murder', 'kill', 'death', 'suicide', 'drugs', 'cocaine', 'heroin',
    'terrorism', 'bomb', 'explosive', 'hack', 'crack', 'virus', 'malware',
    'injection', 'script', 'alert', 'eval', 'document.cookie'
  ];

  constructor(private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const show = () => {
        this.showTopics = true;
      };

      if (document.readyState === 'complete') {
        show();
      } else {
        window.addEventListener('load', show, { once: true });
      }
    } else {
      this.showTopics = true;
    }
  }

  startCBSEGrade8() {
    this.router.navigate(['/cbse', '8', 'subjects']);
  }

  navigateToCBSESubject(subject: any) {
    // Map to the curriculum subject IDs
    const subjectMap: { [key: string]: string } = {
      'science': 'science',
      'mathematics': 'math',
      'english': 'english',
      'computer-science': 'computer-science',
      'hindi': 'hindi',
      'social-studies': 'social-studies'
    };
    const subjectKey = subjectMap[subject.id] || subject.id;
    this.router.navigate(['/cbse', '8', 'subjects', subjectKey, 'chapters']);
  }

  viewPersistedMCQs() {
    this.router.navigate(['/persisted-mcqs']);
  }
}
