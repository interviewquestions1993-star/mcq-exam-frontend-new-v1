import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { CurriculumService } from '../../services/curriculum.service';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface ChapterItem {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

@Component({
  selector: 'app-cbse-chapters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="cbse-chapters-container">
      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <button mat-icon-button type="button" class="back-button" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>Class {{ classNumber }} - {{ subjectDisplayName }}</h1>
          <p class="subtitle">Select chapters to include in your quiz</p>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="isLoading$ | async" class="loading-spinner">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading chapters...</p>
      </div>

      <!-- Chapters List -->
      <div class="chapters-section" *ngIf="!(isLoading$ | async)">
        <div *ngIf="chapters.length === 0" class="empty-state">
          <p>No chapters found for {{ subjectDisplayName || 'this subject' }}.</p>
        </div>
        <div class="chapters-grid" *ngIf="chapters.length > 0">
          <mat-card *ngFor="let chapter of chapters" class="chapter-card" [class.selected]="chapter.id === selectedChapterId">
            <mat-card-content>
              <div class="chapter-header">
                  <label class="chapter-radio">
                    <input type="radio" name="chapterSelect" [(ngModel)]="selectedChapterId" [value]="chapter.id" (change)="onChapterSelect(chapter)" />
                  </label>
                <div class="chapter-info">
                  <h3>{{ chapter.name }}</h3>
                  <p>{{ chapter.description }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Chapter Variant Selector -->
        <div class="question-count-group">
          <label class="count-pill">
            <input
              type="radio"
              name="chapterVariant"
              value="v1"
              [(ngModel)]="selectedVariant"
              class="count-input"
              [disabled]="!selectedChapterId"
            />
            <div class="pill-content">
              <span class="pill-label">v1</span>
              <span class="pill-subtitle">Variant 1</span>
            </div>
          </label>

          <label class="count-pill">
            <input
              type="radio"
              name="chapterVariant"
              value="v2"
              [(ngModel)]="selectedVariant"
              class="count-input"
              [disabled]="!selectedChapterId"
            />
            <div class="pill-content">
              <span class="pill-label">v2</span>
              <span class="pill-subtitle">Variant 2</span>
            </div>
          </label>

          <label class="count-pill">
            <input
              type="radio"
              name="chapterVariant"
              value="v3"
              [(ngModel)]="selectedVariant"
              class="count-input"
              [disabled]="!selectedChapterId"
            />
            <div class="pill-content">
              <span class="pill-label">v3</span>
              <span class="pill-subtitle">Variant 3</span>
            </div>
          </label>

          <label class="count-pill">
            <input
              type="radio"
              name="chapterVariant"
              value="v4"
              [(ngModel)]="selectedVariant"
              class="count-input"
              [disabled]="!selectedChapterId"
            />
            <div class="pill-content">
              <span class="pill-label">v4</span>
              <span class="pill-subtitle">Variant 4</span>
            </div>
          </label>
        </div>

        <!-- Question Count Selector -->
        <div class="question-count-group">
          <label class="count-pill">
            <input
              type="radio"
              name="questionCount"
              [value]="10"
              [(ngModel)]="questionCount"
              class="count-input"
            />
            <div class="pill-content">
              <span class="pill-label">10 Questions</span>
              <span class="pill-subtitle">Full practice set</span>
            </div>
          </label>

          <label class="count-pill">
            <input
              type="radio"
              name="questionCount"
              [value]="20"
              [(ngModel)]="questionCount"
              class="count-input"
            />
            <div class="pill-content">
              <span class="pill-label">20 Questions</span>
              <span class="pill-subtitle">Extended practice</span>
            </div>
          </label>

          <label class="count-pill">
            <input
              type="radio"
              name="questionCount"
              [value]="30"
              [(ngModel)]="questionCount"
              class="count-input"
            />
            <div class="pill-content">
              <span class="pill-label">30 Questions</span>
              <span class="pill-subtitle">Marathon test</span>
            </div>
          </label>

          <label class="count-pill">
            <input
              type="radio"
              name="questionCount"
              [value]="50"
              [(ngModel)]="questionCount"
              class="count-input"
            />
            <div class="pill-content">
              <span class="pill-label">50 Questions</span>
              <span class="pill-subtitle">Exam-style bundle</span>
            </div>
          </label>

          <label class="count-pill">
            <input
              type="radio"
              name="questionCount"
              [value]="70"
              [(ngModel)]="questionCount"
              class="count-input"
            />
            <div class="pill-content">
              <span class="pill-label">70 Questions</span>
              <span class="pill-subtitle">Challenge mode</span>
            </div>
          </label>

          <label class="count-pill">
            <input
              type="radio"
              name="questionCount"
              [value]="100"
              [(ngModel)]="questionCount"
              class="count-input"
            />
            <div class="pill-content">
              <span class="pill-label">100 Questions</span>
              <span class="pill-subtitle">Ultimate practice</span>
            </div>
          </label>

          <label class="count-pill">
            <input
              type="radio"
              name="questionCount"
              [value]="-1"
              [(ngModel)]="questionCount"
              class="count-input"
            />
            <div class="pill-content">
              <span class="pill-label">All Questions</span>
              <span class="pill-subtitle">Use full available pool</span>
            </div>
          </label>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            mat-raised-button
            color="primary"
            class="action-button start-quiz-button"
            [disabled]="!selectedChapterId"
            (click)="startQuiz()"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./cbse-chapters.component.css']
})
export class CbseChaptersComponent implements OnInit, OnDestroy {
  classNumber = 0;
  subjectKey = '';
  subjectDisplayName = '';
  chapters: ChapterItem[] = [];
  questionCount = 10;
  selectedVariant: 'v1' | 'v2' | 'v3' | 'v4' | null = null;
  isLoading$ = new BehaviorSubject<boolean>(false);
  selectedChapterId: string | null = null;
  private destroy$ = new Subject<void>();

  get selectedChapters(): ChapterItem[] {
    if (!this.selectedChapterId) return [];
    const found = this.chapters.find(c => c.id === this.selectedChapterId);
    return found ? [found] : [];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private curriculumService: CurriculumService
  ) {}

  ngOnInit() {
    this.classNumber = +this.route.snapshot.paramMap.get('classNumber')!;
    this.subjectKey = this.route.snapshot.paramMap.get('subject')!;
    this.loadChapters();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadChapters() {
    this.isLoading$.next(true);
    this.curriculumService
      .getChaptersForSubject$(this.classNumber, `class${this.classNumber}-${this.subjectKey}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (chaptersData) => {
          if (chaptersData.length > 0) {
            this.subjectDisplayName = this.subjectKey.replace(/-/g, ' ');
            this.chapters = chaptersData.map(chapter => ({
              id: chapter.id,
              name: chapter.name,
              description: `NCERT syllabus chapter`,
              selected: false
            }));
            // bookName is stored in the curriculum data for the subject
          } else {
            // Fallback for subjects not in curriculum
            this.subjectDisplayName = this.subjectKey.replace(/-/g, ' ');
            this.chapters = [
              { id: '1', name: 'Chapter 1', description: 'Introduction to the subject', selected: false },
              { id: '2', name: 'Chapter 2', description: 'Basic concepts', selected: false },
              { id: '3', name: 'Chapter 3', description: 'Advanced topics', selected: false }
            ];
          }
          this.isLoading$.next(false);
        },
        error: (error) => {
          console.error('Error loading chapters:', error);
          this.isLoading$.next(false);
          this.subjectDisplayName = this.subjectKey.replace(/-/g, ' ');
          this.chapters = [];
        }
      });
  }

  onChapterSelect(chapter: ChapterItem) {
    this.selectedChapterId = chapter.id;
    this.selectedVariant = null;
  }

  startQuiz() {
    if (!this.selectedChapterId) {
      this.snackBar.open('Please select a chapter to start the quiz.', 'Close', {
        duration: 3000
      });
      return;
    }

    if (!this.selectedVariant) {
      this.snackBar.open('Please select a chapter variant (v1-v4) to continue.', 'Close', {
        duration: 3000
      });
      return;
    }

    const selected = this.chapters.find(c => c.id === this.selectedChapterId);
    const selectedChapterName = selected ? selected.name : 'Unknown Chapter';
    const topicValue = `CBSE Class ${this.classNumber} ${this.subjectDisplayName}: ${selectedChapterName}-${this.selectedVariant}`;

    this.router.navigate(['/quiz', topicValue], {
      queryParams: { count: this.questionCount }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}