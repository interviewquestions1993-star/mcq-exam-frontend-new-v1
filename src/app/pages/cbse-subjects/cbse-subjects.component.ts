import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurriculumService } from '../../services/curriculum.service';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface SubjectCard {
  key: string;
  name: string;
  icon: string;
  description: string;
  available: boolean;
}

const SUBJECT_META: Record<string, { icon: string; description: string; displayName: string }> = {
  math: { icon: '🔢', description: 'Numbers, Algebra, Geometry & Statistics', displayName: 'Mathematics' },
  english: { icon: '📝', description: 'Language, Literature & Writing', displayName: 'English' },
  hindi: { icon: '📚', description: 'Language, Literature & Grammar', displayName: 'Hindi' },
  evs: { icon: '🌿', description: 'Environmental studies and life skills', displayName: 'Environmental Studies' },
  science: { icon: '🧪', description: 'Physics, Chemistry & Biology', displayName: 'Science' },
  'social-history': { icon: '🏛️', description: 'Indian history and cultural heritage', displayName: 'History' },
  'social-geography': { icon: '🗺️', description: 'Physical geography and environment', displayName: 'Geography' },
  'social-civics': { icon: '⚖️', description: 'Civics, democracy and citizenship', displayName: 'Civics' },
  economics: { icon: '💰', description: 'Basic economic principles and national economy', displayName: 'Economics' },
  physics: { icon: '⚛️', description: 'Advanced physics concepts', displayName: 'Physics' },
  chemistry: { icon: '🧫', description: 'Advanced chemistry concepts', displayName: 'Chemistry' },
  biology: { icon: '🧬', description: 'Advanced biology concepts', displayName: 'Biology' },
  'computer-science': { icon: '💻', description: 'Programming and digital literacy', displayName: 'Computer Science' },
  accountancy: { icon: '📈', description: 'Accounting principles and finance', displayName: 'Accountancy' },
  'business-studies': { icon: '🏢', description: 'Business, management and entrepreneurship', displayName: 'Business Studies' }
};

@Component({
  selector: 'app-cbse-subjects',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="cbse-subjects-container">
      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <button mat-icon-button class="back-button" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>Class {{ classNumber }} Subjects</h1>
          <p class="subtitle">Choose a subject to view chapters</p>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="isLoading$ | async" class="loading-spinner">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading subjects...</p>
      </div>

      <!-- Subjects Grid -->
      <div class="subjects-section" *ngIf="!(isLoading$ | async)">
        <div *ngIf="subjects.length === 0" class="empty-state">
          <p>No subjects available for Class {{ classNumber }} yet.</p>
        </div>
        <div class="subjects-grid" *ngIf="subjects.length > 0">
          <mat-card
            *ngFor="let subject of subjects"
            class="subject-card"
            [class.unavailable]="!subject.available"
            (click)="subject.available ? selectSubject(subject.key) : null"
          >
            <mat-card-content>
              <div class="subject-content">
                <div class="subject-icon">{{ subject.icon }}</div>
                <h3>{{ subject.name }}</h3>
                <p>{{ subject.description }}</p>
                <div *ngIf="!subject.available" class="coming-soon">Coming Soon</div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./cbse-subjects.component.css']
})
export class CbseSubjectsComponent implements OnInit, OnDestroy {
  classNumber = 0;
  subjects: SubjectCard[] = [];
  isLoading$ = new BehaviorSubject<boolean>(false);
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private curriculumService: CurriculumService
  ) {}

  ngOnInit() {
    this.classNumber = +this.route.snapshot.paramMap.get('classNumber')!;
    this.loadSubjects();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSubjects() {
    this.isLoading$.next(true);
    this.curriculumService
      .getSubjectsForClass$(this.classNumber)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (subjectsData) => {
          this.subjects = subjectsData.map(subject => {
            const subjectKey = subject.id.replace(/^class\d+-/, '');
            const meta = SUBJECT_META[subjectKey] || {
              icon: '📘',
              description: 'NCERT curriculum subject',
              displayName: subject.name
            };

            return {
              key: subjectKey,
              name: meta.displayName,
              icon: meta.icon,
              description: meta.description,
              available: true
            };
          });
          this.isLoading$.next(false);
        },
        error: (error) => {
          console.error('Error loading subjects:', error);
          this.isLoading$.next(false);
          this.subjects = [];
        }
      });
  }

  selectSubject(subjectKey: string) {
    this.router.navigate(['/cbse', this.classNumber, 'subjects', subjectKey, 'chapters']);
  }

  goBack() {
    this.router.navigate(['/cbse']);
  }
}