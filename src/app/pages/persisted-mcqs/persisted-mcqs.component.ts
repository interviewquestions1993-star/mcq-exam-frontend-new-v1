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

interface TopicAnalytics {
  label: string;
  attempts: number;
  averagePercentage: number;
  passRate: number;
  averageScore: number;
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

        <div class="analytics-panel" *ngIf="getValidMCQs().length > 0">
          <div class="analytics-cards">
            <mat-card class="analytics-card">
              <div class="analytics-card-title">Overall Performance</div>
              <div class="analytics-card-value">{{ totalAttempts }}</div>
              <div class="analytics-card-subtitle">Attempts Completed</div>
            </mat-card>
            <mat-card class="analytics-card">
              <div class="analytics-card-title">Average Percentage</div>
              <div class="analytics-card-value">{{ averagePercentage | number:'1.0-0' }}%</div>
              <div class="analytics-card-subtitle">Average across all attempts (actual percentages calculated)</div>
            </mat-card>
            <mat-card class="analytics-card">
              <div class="analytics-card-title">Pass Rate</div>
              <div class="analytics-card-value">{{ passRate | number:'1.0-0' }}%</div>
              <div class="analytics-card-subtitle">Passed attempts</div>
            </mat-card>
          </div>

          <div class="analytics-charts">
            <mat-card class="analytics-chart-card">
              <div class="chart-card-header">Subject Performance</div>
              <div *ngIf="subjectAnalytics.length > 0; else noSubjectData">
                <div *ngFor="let subject of subjectAnalytics" class="chart-row">
                  <div class="chart-row-label">{{ subject.label }}</div>
                  <div class="chart-bar-track">
                    <div class="chart-bar-fill" [style.width]="getChartBarWidth(subject.averagePercentage)"></div>
                  </div>
                  <div class="chart-row-value">{{ subject.averagePercentage | number:'1.0-0' }}%</div>
                </div>
              </div>
              <ng-template #noSubjectData>
                <p class="empty-chart-text">No subject-level history available yet.</p>
              </ng-template>
            </mat-card>

            <mat-card class="analytics-chart-card">
              <div class="chart-card-header">Chapter Performance</div>
              <div *ngIf="chapterAnalytics.length > 0; else noChapterData">
                <div *ngFor="let chapter of chapterAnalytics" class="chart-row">
                  <div class="chart-row-label">{{ chapter.label }}</div>
                  <div class="chart-bar-track">
                    <div class="chart-bar-fill" [style.width]="getChartBarWidth(chapter.averagePercentage)"></div>
                  </div>
                  <div class="chart-row-value">{{ chapter.averagePercentage | number:'1.0-0' }}%</div>
                </div>
              </div>
              <ng-template #noChapterData>
                <p class="empty-chart-text">No chapter-level history available yet.</p>
              </ng-template>
            </mat-card>
          </div>
        </div>

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
                  <p *ngIf="!areAnswersEquivalent(getSelectedAnswer(question, mcq), question.correct_answer, question)">
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

    .analytics-panel {
      display: grid;
      gap: 20px;
      margin-bottom: 30px;
      grid-template-columns: 1fr;
    }

    .analytics-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .analytics-card {
      padding: 20px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.14);
      color: white;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
      min-height: 140px;
    }

    .analytics-card-title {
      font-size: 14px;
      font-weight: 600;
      opacity: 0.85;
      margin-bottom: 12px;
    }

    .analytics-card-value {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .analytics-card-subtitle {
      font-size: 13px;
      opacity: 0.78;
    }

    .analytics-charts {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    }

    .analytics-chart-card {
      padding: 20px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.16);
      color: white;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
    }

    .chart-card-header {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .chart-row {
      display: grid;
      grid-template-columns: 1fr 220px 70px;
      gap: 12px;
      align-items: center;
      margin-bottom: 14px;
    }

    .chart-row-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.92);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chart-bar-track {
      background: rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      height: 16px;
      width: 100%;
      overflow: hidden;
    }

    .chart-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #6ee7b7 0%, #3b82f6 100%);
      border-radius: 12px 0 0 12px;
      transition: width 0.35s ease;
    }

    .chart-row-value {
      font-size: 14px;
      font-weight: 600;
      text-align: right;
    }

    .empty-chart-text {
      color: rgba(255, 255, 255, 0.78);
      font-size: 14px;
      margin: 0;
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
  totalAttempts = 0;
  totalQuestions = 0;
  averagePercentage = 0;
  passRate = 0;
  subjectAnalytics: TopicAnalytics[] = [];
  chapterAnalytics: TopicAnalytics[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe((auth) => {
      this.isAuthenticated = auth;
      if (auth) {
        this.loadPersistedMCQs();
      } else {
        this.isLoading = false;
      }
    });
  }

  private loadPersistedMCQs() {
    this.isLoading = true;
    const baseUrl = (window as any).__API_URL__ || 'https://mcq-exam-backend-new-v1.onrender.com';
    const apiUrl = `${baseUrl}/api/mcq/history`;

    this.http.get<PersistedMCQ[]>(apiUrl).subscribe(
      (data) => {
        this.mcqs = data;
        this.computeAnalytics(data);
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
    return option.replace(/^[A-D][\)\.\:]\s*/i, '').trim();
  }

  private normalizeOptionText(text: string | null | undefined): string {
    return this.getOptionText(String(text || ''))
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  private normalizeAnswerLetter(answer: string | null | undefined): string | null {
    if (!answer) return null;
    const trimmed = answer.toString().trim();
    const m = trimmed.match(/^([A-D])(?:[\)\.\:]\s*|$)/i);
    if (m) return m[1].toUpperCase();
    return null;
  }

  private getOptionLetterForAnswer(question: MCQQuestion, answer: string | null | undefined): string | null {
    if (!answer) return null;
    const letter = this.normalizeAnswerLetter(answer);
    if (letter) {
      return letter;
    }

    const normalizedAnswer = this.normalizeOptionText(answer);
    if (!normalizedAnswer) {
      return null;
    }

    for (let i = 0; i < question.options.length; i++) {
      const optionNormalized = this.normalizeOptionText(question.options[i]);
      if (optionNormalized === normalizedAnswer) {
        return this.getOptionLabel(i);
      }
    }

    return null;
  }

  areAnswersEquivalent(answerA: string | null | undefined, answerB: string | null | undefined, question: MCQQuestion): boolean {
    const letterA = this.getOptionLetterForAnswer(question, answerA);
    const letterB = this.getOptionLetterForAnswer(question, answerB);
    if (letterA && letterB) {
      return letterA === letterB;
    }

    const normalizedA = this.normalizeOptionText(answerA);
    const normalizedB = this.normalizeOptionText(answerB);
    return normalizedA !== '' && normalizedA === normalizedB;
  }

  isCorrectOption(option: string, question: MCQQuestion): boolean {
    const idx = question.options.indexOf(option);
    const optionLetter = idx >= 0 ? this.getOptionLabel(idx) : null;
    const correctLetter = this.getOptionLetterForAnswer(question, question.correct_answer);

    if (correctLetter && optionLetter) {
      return correctLetter === optionLetter;
    }

    const normCorrectText = this.normalizeOptionText(question.correct_answer || '');
    const normOptionText = this.normalizeOptionText(option);
    return normCorrectText !== '' && normCorrectText === normOptionText;
  }

  isSelectedOption(option: string, question: MCQQuestion, mcq?: PersistedMCQ): boolean {
    const selected = mcq ? this.getSelectedAnswer(question, mcq) : null;
    if (!selected) return false;

    const idx = question.options.indexOf(option);
    const optionLetter = idx >= 0 ? this.getOptionLabel(idx) : null;
    const selectedLetter = this.getOptionLetterForAnswer(question, selected);

    if (selectedLetter && optionLetter) {
      return selectedLetter === optionLetter;
    }

    const normalizedSelected = this.normalizeOptionText(selected);
    const normalizedOption = this.normalizeOptionText(option);
    return normalizedSelected !== '' && normalizedSelected === normalizedOption;
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

    const optionLetter = this.getOptionLetterForAnswer(question, answer);
    if (optionLetter) {
      const index = optionLetter.charCodeAt(0) - 65;
      const optionText = question?.options?.[index];
      if (optionText) {
        return `${optionLetter}. ${this.getOptionText(optionText)}`;
      }
    }

    return this.getOptionText(answer).trim() || answer.trim();
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

  private computeAnalytics(mcqs: PersistedMCQ[]) {
    const validMcqs = mcqs.filter((mcq) => this.hasValidQuestions(mcq));
    const subjectMap = new Map<string, { attempts: number; percentageSum: number; passCount: number; scoreSum: number; }>();
    const chapterMap = new Map<string, { attempts: number; percentageSum: number; passCount: number; scoreSum: number; }>();

    let totalPercentage = 0;
    let passedCount = 0;
    let questionCount = 0;

    validMcqs.forEach((mcq) => {
      const percentage = typeof mcq.percentage === 'number' ? mcq.percentage : mcq.total > 0 ? Math.round((mcq.score / mcq.total) * 100) : 0;
      const passed = percentage >= 60;
      totalPercentage += percentage;
      questionCount += mcq.total || 0;
      if (passed) {
        passedCount += 1;
      }

      const { subject, chapter } = this.extractTopicMetadata(mcq.topic);
      this.mergeAnalyticsEntry(subjectMap, subject, percentage, passed, mcq.score);
      this.mergeAnalyticsEntry(chapterMap, chapter, percentage, passed, mcq.score);
    });

    this.totalAttempts = validMcqs.length;
    this.totalQuestions = questionCount;
    this.averagePercentage = validMcqs.length > 0 ? totalPercentage / validMcqs.length : 0;
    this.passRate = validMcqs.length > 0 ? (passedCount / validMcqs.length) * 100 : 0;

    this.subjectAnalytics = this.buildAnalyticsArray(subjectMap).sort((a, b) => b.passRate - a.passRate);
    this.chapterAnalytics = this.buildAnalyticsArray(chapterMap).sort((a, b) => b.passRate - a.passRate);
  }

  private mergeAnalyticsEntry(
    map: Map<string, { attempts: number; percentageSum: number; passCount: number; scoreSum: number }> ,
    key: string,
    percentage: number,
    passed: boolean,
    score: number
  ) {
    const existing = map.get(key) ?? { attempts: 0, percentageSum: 0, passCount: 0, scoreSum: 0 };
    existing.attempts += 1;
    existing.percentageSum += percentage;
    existing.passCount += passed ? 1 : 0;
    existing.scoreSum += score;
    map.set(key, existing);
  }

  private buildAnalyticsArray(map: Map<string, { attempts: number; percentageSum: number; passCount: number; scoreSum: number }>): TopicAnalytics[] {
    const result: TopicAnalytics[] = [];
    for (const [label, entry] of map.entries()) {
      result.push({
        label,
        attempts: entry.attempts,
        averagePercentage: entry.attempts > 0 ? entry.percentageSum / entry.attempts : 0,
        passRate: entry.attempts > 0 ? (entry.passCount / entry.attempts) * 100 : 0,
        averageScore: entry.attempts > 0 ? entry.scoreSum / entry.attempts : 0
      });
    }
    return result;
  }

  private extractTopicMetadata(topic: string): { subject: string; chapter: string } {
    if (!topic || !topic.trim()) {
      return { subject: 'Unknown Subject', chapter: 'Unknown Chapter' };
    }

    const rawTopic = topic.trim();
    const colonIndex = rawTopic.indexOf(':');
    if (colonIndex >= 0) {
      return {
        subject: rawTopic.slice(0, colonIndex).trim(),
        chapter: rawTopic.slice(colonIndex + 1).trim() || rawTopic.slice(0, colonIndex).trim()
      };
    }

    const separators = [' - ', ' | '];
    for (const separator of separators) {
      const separatorIndex = rawTopic.indexOf(separator);
      if (separatorIndex >= 0) {
        return {
          subject: rawTopic.slice(0, separatorIndex).trim(),
          chapter: rawTopic.slice(separatorIndex + separator.length).trim() || rawTopic.slice(0, separatorIndex).trim()
        };
      }
    }

    return { subject: rawTopic, chapter: rawTopic };
  }

  getChartBarWidth(value: number): string {
    const normalized = Math.max(0, Math.min(100, value));
    return `${normalized}%`;
  }
}
