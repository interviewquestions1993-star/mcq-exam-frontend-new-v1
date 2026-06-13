import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
  localId?: string;
}

interface PersistedMCQ {
  id: string;
  topic: string;
  num_questions: number;
  questions: MCQQuestion[];
  answers: { [key: string]: string };
  score: number;
  total: number;
  percentage: number;
  created_at: string;
  status: string;
}

@Component({
  selector: 'app-persisted-mcqs',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="persisted-container">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading your exam history...</p>
      </div>

      <div *ngIf="!isLoading && !isAuthenticated" class="no-data-state">
        <div class="no-data-card">
          <mat-icon class="no-data-icon">login</mat-icon>
          <h2>Login Required</h2>
          <p>Sign in to view your personalized exam history and review past quiz attempts.</p>
          <button mat-raised-button color="primary" (click)="goLogin()">
            Sign in with Google
          </button>
        </div>
      </div>

      <!-- No Data State -->
      <div *ngIf="!isLoading && isAuthenticated && mcqs.length === 0" class="no-data-state">
        <div class="no-data-card">
          <mat-icon class="no-data-icon">history</mat-icon>
          <h2>No Exam History Yet</h2>
          <p>You have not completed any quizzes yet. Finish a quiz to see your history here.</p>
          <button mat-raised-button color="primary" (click)="goHome()">
            Create New Quiz
          </button>
        </div>
      </div>

      <!-- MCQs Display -->
      <div *ngIf="!isLoading && getValidMCQs().length > 0" class="mcqs-display">
        <h1 class="page-title">📚 Your Exam History</h1>
        <p class="page-subtitle">Total Attempts: {{ getValidMCQs().length }}</p>

        <div class="mcqs-list">
          <mat-card *ngFor="let mcq of getValidMCQs(); let idx = index" class="mcq-card">
            <!-- Header -->
            <div class="mcq-header">
              <div class="mcq-title">
                <h3>{{ idx + 1 }}. {{ mcq.topic }}</h3>
              </div>
              <div class="mcq-meta">
                <span class="question-count">{{ mcq.num_questions }} Questions</span>
                <span class="score-badge">Score: {{ mcq.score }}/{{ mcq.total }} ({{ mcq.percentage }}%)</span>
                <span class="created-date">{{ formatDate(mcq.created_at) }}</span>
              </div>
            </div>

            <!-- Questions -->
            <div class="questions-section">
              <div *ngFor="let question of mcq.questions; let qIdx = index" class="question-item">
                <div class="question-number">Q{{ qIdx + 1 }}</div>
                <div class="question-content">
                  <h4 class="question-text">{{ question.question }}</h4>
                  <div class="difficulty-badge" [ngClass]="'difficulty-' + question.difficulty">
                    {{ question.difficulty | uppercase }}
                  </div>
                </div>

                <div class="answer-summary">
                  <p><strong>Your Answer:</strong> {{ getAnswerLabelWithText(question, getSelectedAnswer(question, mcq)) || 'Not answered' }}</p>
                  <p *ngIf="getSelectedAnswer(question, mcq) !== question.correct_answer">
                    <strong>Correct Answer:</strong> {{ getAnswerLabelWithText(question, question.correct_answer) || question.correct_answer }}
                  </p>
                </div>

                <!-- Options -->
                <div class="options-display">
                  <div *ngFor="let option of question.options; let oIdx = index" class="option-item" [ngClass]="getOptionClass(option, question, mcq)">
                    <span class="option-letter">{{ getOptionLabel(oIdx) }}</span>
                    <span class="option-text">{{ getOptionText(option) }}</span>
                    <span *ngIf="isCorrectOption(option, question)" class="correct-indicator">✅ Correct</span>
                    <span *ngIf="isSelectedOption(option, question, mcq) && !isCorrectOption(option, question)" class="wrong-indicator">❌ Incorrect</span>
                  </div>
                </div>

                <!-- Explanation -->
                <div class="explanation-section">
                  <p><strong>Explanation:</strong> {{ question.explanation }}</p>
                </div>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button mat-raised-button class="home-button" (click)="goHome()">
            🏠 Home
          </button>
          <button mat-raised-button class="refresh-button" (click)="refresh()">
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .persisted-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      color: white;
      font-size: 18px;
    }

    .no-data-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
    }

    .no-data-card {
      background: var(--card-bg, white);
      color: var(--text-color, #222a42);
      border-radius: 12px;
      padding: 60px 40px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .no-data-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: #999;
      margin-bottom: 20px;
    }

    .page-title {
      color: white;
      text-align: center;
      margin-bottom: 10px;
      font-size: 32px;
    }

    .page-subtitle {
      color: rgba(255, 255, 255, 0.9);
      text-align: center;
      margin-bottom: 30px;
      font-size: 16px;
    }

    .mcqs-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 30px;
    }

    .mcq-card {
      background: var(--card-bg, white);
      color: var(--text-color, #222a42);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.3s ease;
    }

    .mcq-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .mcq-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .mcq-header h3 {
      margin: 0;
      font-size: 20px;
    }

    .mcq-meta {
      display: flex;
      gap: 20px;
      font-size: 14px;
    }

    .question-count, .created-date {
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 20px;
    }

    .questions-section {
      padding: 20px;
    }

    .question-item {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }

    .question-item:last-child {
      border-bottom: none;
    }

    .question-number {
      font-weight: bold;
      color: #667eea;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .question-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .question-text {
      margin: 0;
      font-size: 16px;
      flex: 1;
      color: var(--text-color, #222a42);
    }

    .difficulty-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 12px;
      white-space: nowrap;
    }

    .difficulty-easy {
      background: #d4edda;
      color: #155724;
    }

    .difficulty-medium {
      background: #fff3cd;
      color: #856404;
    }

    .difficulty-hard {
      background: #f8d7da;
      color: #721c24;
    }

    .options-display {
      margin: 15px 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .option-item {
      padding: 12px;
      border: 2px solid var(--muted-border, #ddd);
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.3s ease;
      background: transparent;
      color: var(--text-color, #222a42);
    }

    .option-item.correct {
      background: #d4edda;
      border-color: #28a745;
    }

    .option-item.selected {
      background: #e7f1ff;
      border-color: #4f8cff;
    }

    .option-item.wrong {
      background: #f8d7da;
      border-color: #dc3545;
      color: #721c24;
    }

    .wrong-indicator {
      color: #dc3545;
      font-weight: bold;
      margin-left: 8px;
    }

    .score-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 600;
      margin-left: 12px;
      white-space: nowrap;
    }

    .option-letter {
      font-weight: bold;
      color: #667eea;
      min-width: 30px;
    }

    .option-text {
      flex: 1;
      color: var(--text-color, #222a42);
    }

    .correct-indicator {
      color: #28a745;
      font-weight: bold;
    }

    .answer-summary {
      margin-top: 15px;
      padding: 12px;
      background: var(--card-bg, #f5f7ff);
      border-left: 4px solid #4f8cff;
      border-radius: 4px;
      color: var(--text-color, #222a42);
    }

    .answer-summary p {
      margin: 0 0 8px 0;
      color: var(--text-color, #222a42);
      font-size: 14px;
    }

    .explanation-section {
      margin-top: 15px;
      padding: 12px;
      background: var(--card-bg, #f8f9fa);
      border-left: 4px solid #667eea;
      border-radius: 4px;
      color: var(--text-color, #222a42);
    }

    .explanation-section p {
      margin: 0;
      color: var(--text-color, #222a42);
      font-size: 14px;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    }

    .home-button, .refresh-button {
      padding: 12px 30px;
      font-size: 16px;
      border-radius: 8px;
    }

    .home-button {
      background: var(--card-bg, white);
      color: var(--text-color, #667eea);
    }

    .refresh-button {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
  `]
})
export class PersistedMcqsComponent implements OnInit {
  mcqs: PersistedMCQ[] = [];
  isLoading = true;
  isAuthenticated = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.loadPersistedMCQs();
    } else {
      this.isLoading = false;
    }
  }

  private loadPersistedMCQs() {
    this.isLoading = true;
    const baseUrl = (window as any).__API_URL__ || 'https://mcq-exam-backend-new-v1.onrender.com';
    const apiUrl = `${baseUrl}/api/mcq/history`;

    this.http.get<PersistedMCQ[]>(apiUrl).subscribe(
      (data) => {
        this.mcqs = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading exam history:', error);
        this.snackBar.open('Failed to load exam history', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    );
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D
  }

  getOptionText(option: string): string {
    // Remove the letter prefix if it exists (e.g., "A) Option" -> "Option")
    return option.replace(/^[A-D]\)\s*/, '');
  }

  isCorrectOption(option: string, question: MCQQuestion): boolean {
    for (let i = 0; i < question.options.length; i++) {
      const optionLetter = this.getOptionLabel(i);
      if (optionLetter === question.correct_answer && option === question.options[i]) {
        return true;
      }
    }
    return false;
  }

  isSelectedOption(option: string, question: MCQQuestion, mcq?: PersistedMCQ): boolean {
    const selected = mcq ? this.getSelectedAnswer(question, mcq) : null;
    if (!selected) return false;

    // option strings are like 'A) Option text' — compare by option letter
    const idx = question.options.indexOf(option);
    if (idx < 0) return false;
    const letter = this.getOptionLabel(idx);
    return selected.trim().toUpperCase() === letter;
  }

  getSelectedAnswer(question: MCQQuestion, mcq: PersistedMCQ): string | null {
    if (!mcq.answers) {
      return null;
    }

    const key = question.localId || question.id.toString();
    return mcq.answers[key] || null;
  }

  getAnswerLabelWithText(question: MCQQuestion, answer: string | null): string | null {
    if (!answer) {
      return null;
    }

    const label = answer.trim().toUpperCase();
    const index = label.charCodeAt(0) - 65;
    const optionText = question?.options?.[index];

    if (optionText) {
      return `${label}. ${optionText}`;
    }

    return answer;
  }

  getOptionClass(option: string, question: MCQQuestion, mcq?: PersistedMCQ): string {
    const classNames = ['option-item'];
    if (this.isCorrectOption(option, question)) {
      classNames.push('correct');
    }
    if (this.isSelectedOption(option, question, mcq)) {
      classNames.push('selected');
      // mark wrong if selected but not correct
      if (!this.isCorrectOption(option, question)) {
        classNames.push('wrong');
      }
    }
    return classNames.join(' ');
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  }

  hasValidQuestions(mcq: PersistedMCQ): boolean {
    return mcq && mcq.questions && mcq.questions.length > 0;
  }

  getValidMCQs(): PersistedMCQ[] {
    return this.mcqs.filter(mcq => this.hasValidQuestions(mcq));
  }

  goHome() {
    this.router.navigate(['/']);
  }

  goLogin() {
    this.router.navigate(['/login']);
  }

  refresh() {
    this.loadPersistedMCQs();
  }
}
