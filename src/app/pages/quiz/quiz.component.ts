import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MCQService, MCQQuestion, MCQResponse } from '../../services/mcq.service';

interface QuizQuestion extends MCQQuestion {
  localId: string;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressBarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="quiz-container">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="loading-card">
          <p class="loader-heading">Preparing your quiz...</p>
          <div class="loading-bar-wrapper">
            <mat-progress-bar mode="determinate" [value]="loadProgress" color="primary" class="stylish-progress"></mat-progress-bar>
            <div class="loading-progress-text">{{ loadProgress }}% complete</div>
          </div>
          <div *ngIf="busyMessage" class="loading-hold-message">
            {{ busyMessage }}
          </div>
          <div class="loading-steps">
            <span *ngFor="let step of loadingSteps" [class.active]="loadProgress >= step.value">{{ step.label }}</span>
          </div>
        </div>
      </div>

      <!-- Quiz State -->
      <div *ngIf="!isLoading && questions.length > 0" class="quiz-state">
        <!-- Progress Bar -->
        <div class="progress-header">
          <div class="progress-info">
            <span class="current-question">Question {{ currentIndex + 1 }} of {{ questions.length }}</span>
            <span class="progress-percentage">{{ getCurrentProgress() }}%</span>
          </div>
          <mat-progress-bar mode="determinate" [value]="getCurrentProgress()"></mat-progress-bar>
        </div>

        <!-- Question Card -->
        <div class="question-card">
          <mat-card class="question-container">
            <!-- Header -->
            <div class="question-header">
              <div class="difficulty-badge" [ngClass]="'difficulty-' + currentQuestion.difficulty">
                {{ currentQuestion.difficulty | uppercase }}
              </div>
            </div>

            <!-- Question Text -->
            <h2 class="question-text">{{ currentQuestion.question }}</h2>

            <!-- Options -->
            <div class="options-container">
              <ng-container *ngIf="currentQuestion.options.length; else noOptions">
                <div *ngFor="let option of currentQuestion.options; let i = index" class="option">
                  <label class="option-label">
                    <input
                      type="radio"
                      [name]="'question-' + currentQuestion.localId"
                      [value]="getOptionLabel(i)"
                      [(ngModel)]="selectedAnswers[currentQuestion.localId]"
                      class="radio-input"
                    />
                    <span class="option-text">{{ option }}</span>
                  </label>
                </div>
              </ng-container>
              <ng-template #noOptions>
                <div class="option empty-state">Questions are loading or unavailable. Please wait.</div>
              </ng-template>
            </div>
          </mat-card>
        </div>

        <!-- Navigation Buttons -->
        <div class="navigation-buttons">
          <button
            mat-stroked-button
            (click)="previousQuestion()"
            [disabled]="currentIndex === 0"
            class="nav-button"
          >
            <mat-icon>arrow_back</mat-icon>
            Previous
          </button>

          <span class="question-counter">{{ currentIndex + 1 }} / {{ questions.length }}</span>

          <button
            *ngIf="currentIndex < questions.length - 1 || (currentIndex === questions.length - 1 && moreQuestionsLoading)"
            mat-raised-button
            color="primary"
            (click)="nextQuestion()"
            [disabled]="currentIndex === questions.length - 1 && moreQuestionsLoading"
            class="nav-button"
          >
            <span *ngIf="!(currentIndex === questions.length - 1 && moreQuestionsLoading)">Next</span>
            <span *ngIf="currentIndex === questions.length - 1 && moreQuestionsLoading" class="loading-text">
              {{ loadingMoreMessage }}{{ loadingMoreDots }}
            </span>
            <mat-icon *ngIf="!(currentIndex === questions.length - 1 && moreQuestionsLoading)">arrow_forward</mat-icon>
            <mat-spinner *ngIf="currentIndex === questions.length - 1 && moreQuestionsLoading" diameter="20"></mat-spinner>
          </button>

          <button
            *ngIf="currentIndex === questions.length - 1 && !moreQuestionsLoading"
            mat-raised-button
            color="accent"
            (click)="submitQuiz()"
            class="nav-button submit-button"
          >
            Submit Quiz
            <mat-icon>check_circle</mat-icon>
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="!isLoading && questions.length === 0 && error" class="error-state">
        <mat-card>
          <div class="error-content">
            <mat-icon class="error-icon">error_outline</mat-icon>
            <h2>Failed to Load Questions</h2>
            <p>{{ error }}</p>
            <button mat-raised-button color="primary" (click)="goHome()">
              Try Again
            </button>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  topic: string = '';
  questions: QuizQuestion[] = [];
  currentIndex = 0;
  isLoading = false;
  targetQuestionCount = 5;
  loadProgress = 0;
  busyMessage = '';
  loadingSteps = [
    { value: 10, label: '10% complete' },
    { value: 20, label: '20% complete' },
    { value: 30, label: '30% complete' },
    { value: 40, label: '40% complete' },
    { value: 50, label: '50% complete' },
    { value: 60, label: '60% complete' },
    { value: 70, label: '70% complete' },
    { value: 80, label: '80% complete' },
    { value: 90, label: '90% complete' },
    { value: 100, label: '100% complete' }
  ];
  private loadingInterval: any;
  error: string = '';
  selectedAnswers: { [key: string]: string } = {};
  moreQuestionsLoading = false;
  loadingMoreMessage = 'Please wait — pulling more questions';
  loadingMoreDots = '';
  private loadingMoreDotsInterval: any;

  get currentQuestion(): QuizQuestion {
    return this.questions[this.currentIndex];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mcqService: MCQService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.topic = this.route.snapshot.paramMap.get('topic') || '';
    const countParam = Number(this.route.snapshot.queryParamMap.get('count'));
    this.targetQuestionCount = [5, 10].includes(countParam) ? countParam : 5;
    this.loadQuestions();
  }

  loadQuestions() {
    this.isLoading = true;
    this.error = '';
    this.startLoadingProgress();
    
    // Load initial 2 questions
    this.mcqService.generateQuestions(this.topic, 2).subscribe({
      next: (response: MCQResponse) => {
        this.questions = this.mapQuestions(response.questions || []);
        this.completeLoadingProgress();
        this.isLoading = false;

        const missingQuestions = Math.max(0, 2 - this.questions.length);
        if (missingQuestions > 0) {
          this.loadAdditionalQuestions(missingQuestions, true, () => {
            this.startBackgroundFetchSequence();
          });
        } else {
          this.startBackgroundFetchSequence();
        }
      },
      error: (err) => {
        this.error = 'Failed to load questions. Please try again.';
        this.stopLoadingProgress();
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  private loadAdditionalQuestions(numQuestions: number = 3, silent: boolean = false, callback?: () => void) {
    this.moreQuestionsLoading = true;
    this.startLoadingMoreAnimation();
    this.mcqService.generateQuestions(this.topic, numQuestions).subscribe({
      next: (response: MCQResponse) => {
        const additional = this.mapQuestions(response.questions || []);
        additional.forEach(question => this.questions.push(question));
        this.moreQuestionsLoading = false;
        this.stopLoadingMoreAnimation();
        if (callback) {
          callback();
        }
      },
      error: (err) => {
        if (!silent) {
          console.error('Failed to load additional questions:', err);
        }
        this.moreQuestionsLoading = false;
        this.stopLoadingMoreAnimation();
        if (callback) {
          callback();
        }
      }
    });
  }

  private startLoadingProgress() {
    this.loadProgress = 0;
    this.busyMessage = '';
    this.stopLoadingProgress();
    this.loadingInterval = setInterval(() => {
      if (this.loadProgress < 90) {
        this.loadProgress += 10;
      } else {
        this.loadProgress = 100;
        this.busyMessage = 'Servers are busy — please hold on while we fetch your questions.';
        this.stopLoadingProgress();
      }
    }, 2000); // 2 seconds per increment for ~20 second total
  }

  private completeLoadingProgress() {
    this.loadProgress = 100;
    this.busyMessage = '';
    this.stopLoadingProgress();
  }

  private startLoadingMoreAnimation() {
    this.stopLoadingMoreAnimation();
    this.loadingMoreDots = '';
    this.loadingMoreDotsInterval = setInterval(() => {
      this.loadingMoreDots = this.loadingMoreDots.length < 3 ? this.loadingMoreDots + '.' : '';
    }, 500);
  }

  private stopLoadingMoreAnimation() {
    if (this.loadingMoreDotsInterval) {
      clearInterval(this.loadingMoreDotsInterval);
      this.loadingMoreDotsInterval = null;
    }
    this.loadingMoreDots = '';
  }

  private stopLoadingProgress() {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
      this.loadingInterval = null;
    }
  }

  private getBackgroundBatchSizes(): number[] {
    return this.targetQuestionCount === 10 ? [2, 6] : [3];
  }

  private startBackgroundFetchSequence() {
    const remaining = this.targetQuestionCount - this.questions.length;
    if (remaining <= 0) {
      return;
    }
    const batchSizes = this.getBackgroundBatchSizes();
    this.loadBackgroundBatch(batchSizes, 0);
  }

  private loadBackgroundBatch(batchSizes: number[], index: number) {
    const remaining = Math.max(0, this.targetQuestionCount - this.questions.length);
    if (index >= batchSizes.length || remaining <= 0) {
      this.moreQuestionsLoading = false;
      this.stopLoadingMoreAnimation();
      return;
    }

    const batchSize = Math.min(batchSizes[index], remaining);
    this.moreQuestionsLoading = true;
    this.startLoadingMoreAnimation();
    this.mcqService.generateQuestions(this.topic, batchSize).subscribe({
      next: (response: MCQResponse) => {
        const additional = this.mapQuestions(response.questions || []);
        additional.forEach(question => this.questions.push(question));

        if (this.questions.length < this.targetQuestionCount) {
          this.loadBackgroundBatch(batchSizes, index + 1);
        } else {
          this.moreQuestionsLoading = false;
          this.stopLoadingMoreAnimation();
        }
      },
      error: (err) => {
        console.error('Failed to load background questions:', err);
        this.moreQuestionsLoading = false;
        this.stopLoadingMoreAnimation();
      }
    });
  }

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D
  }

  getCurrentProgress(): number {
    return Math.round(((this.currentIndex + 1) / this.questions.length) * 100);
  }

  private mapQuestions(questions: MCQQuestion[]): QuizQuestion[] {
    return questions.map((question, index) => ({
      ...question,
      localId: `${question.id}-${Date.now()}-${Math.random().toString(36).slice(2)}-${index}`
    }));
  }

  submitQuiz() {
    // Calculate score
    let score = 0;
    this.questions.forEach(question => {
      if (this.selectedAnswers[question.localId] === question.correct_answer) {
        score++;
      }
    });

    // Store results and navigate
    sessionStorage.setItem('quizResults', JSON.stringify({
      topic: this.topic,
      score,
      total: this.questions.length,
      percentage: Math.round((score / this.questions.length) * 100),
      answers: this.selectedAnswers,
      questions: this.questions
    }));

    this.router.navigate(['/results']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
