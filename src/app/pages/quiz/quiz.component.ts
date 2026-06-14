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
import { AuthService } from '../../services/auth.service';

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
          </div>
          <div *ngIf="busyMessage" class="loading-hold-message">
            {{ busyMessage }}
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
  targetQuestionCount = 10;
  loadProgress = 0;
  busyMessage = '';
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
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.topic = this.route.snapshot.paramMap.get('topic') || '';
    const countParam = Number(this.route.snapshot.queryParamMap.get('count'));
    this.targetQuestionCount = countParam === -1 ? -1 : [10, 20, 30, 50, 70, 100].includes(countParam) ? countParam : 10;
    this.loadQuestions();
  }

  loadQuestions() {
    this.isLoading = true;
    this.error = '';
    this.startLoadingProgress();

    this.mcqService.generateQuestions(this.topic, this.targetQuestionCount).subscribe({
      next: (response: MCQResponse) => {
        if (response.status === 'chapter_not_available') {
          this.error = response.message || 'This chapter is not yet available. Please try another chapter.';
          this.stopLoadingProgress();
          this.isLoading = false;
          return;
        }

        this.questions = this.mapQuestions(response.questions || []);
        this.completeLoadingProgress();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load questions. Please try again.';
        this.stopLoadingProgress();
        this.isLoading = false;
        console.error(err);
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

  private normalizeAnswer(answer: string | undefined | null): string {
    return String(answer || '')
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[\.\)]/g, '')
      .toUpperCase();
  }

  private normalizeOptionText(text: string): string {
    return String(text || '')
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[\.\)]/g, '')
      .toUpperCase();
  }

  private getOptionLetterForText(question: MCQQuestion, answerText: string): string | null {
    const normalizedAnswer = this.normalizeAnswer(answerText);
    if (!normalizedAnswer) {
      return null;
    }

    for (let i = 0; i < question.options.length; i++) {
      const optionLabel = this.getOptionLabel(i);
      const optionText = this.normalizeOptionText(question.options[i]);
      if (normalizedAnswer === optionText || normalizedAnswer === optionLabel || optionText.includes(normalizedAnswer) || normalizedAnswer.includes(optionText)) {
        return optionLabel;
      }
    }

    return null;
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
      const selectedRaw = this.selectedAnswers[question.localId];
      const selected = this.normalizeAnswer(selectedRaw);
      const selectedLetter = selected ? selected.charAt(0) : '';
      const selectedText = selected ? this.normalizeOptionText(selectedRaw || '') : '';

      const correctRaw = question.correct_answer;
      const correctText = this.normalizeAnswer(correctRaw);
      const correctLetter = this.getOptionLetterForText(question, correctRaw);

      if (selected && correctLetter && selectedLetter === correctLetter) {
        score++;
        return;
      }

      if (selectedText && correctText && selectedText === correctText) {
        score++;
      }
    });

    const total = this.questions.length;
    const currentUser = this.authService.getCurrentUser();
    const quizResult: any = {
      topic: this.topic,
      score,
      total,
      percentage: total > 0 ? Math.round((score / total) * 100) : 0,
      answers: this.selectedAnswers,
      questions: this.questions,
      num_questions: total,
      status: 'completed'
    };

    if (currentUser) {
      quizResult.user_id = currentUser.id;
      quizResult.user_email = currentUser.email;
      quizResult.user_name = currentUser.name;
    }

    // Store results locally for immediate review
    sessionStorage.setItem('quizResults', JSON.stringify(quizResult));

    // Persist the exam history only for logged-in users
    if (currentUser) {
      this.mcqService.saveQuizHistory(quizResult).subscribe({
        next: () => console.log('Quiz history saved'),
        error: (err) => console.warn('Could not save quiz history', err)
      });
    }

    this.router.navigate(['/results']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
