import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

interface QuizResults {
  topic: string;
  score: number;
  total: number;
  percentage: number;
  answers: { [key: number]: string };
  questions: any[];
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule
  ],
  template: `
    <div class="results-container">
      <div *ngIf="results; else noResults">
        <div class="summary-card" [ngClass]="'score-' + getGrade(results.percentage)">
          <div class="score-circle">
            <div class="circle-value">{{ results.percentage }}%</div>
            <div class="circle-meta">{{ results.score }}/{{ results.total }}</div>
          </div>
          <div class="summary-details">
            <h2>{{ getTitleByGrade(getGrade(results.percentage)) }}</h2>
            <p class="topic-name">{{ results.topic }}</p>
            <p class="summary-text">{{ getFeedback(results.percentage) }}</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div>
              <p class="stat-label">Correct</p>
              <p class="stat-value">{{ results.score }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">❌</div>
            <div>
              <p class="stat-label">Incorrect</p>
              <p class="stat-value">{{ results.total - results.score }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">❓</div>
            <div>
              <p class="stat-label">Total Questions</p>
              <p class="stat-value">{{ results.total }}</p>
            </div>
          </div>
        </div>

        <div class="review-card">
          <h3>Review Your Answers</h3>
          <div class="answers-list">
            <div
              *ngFor="let question of results.questions"
              class="answer-item"
              [ngClass]="{ 'correct': results.answers[question.localId || question.id] === question.correct_answer, 'incorrect': results.answers[question.localId || question.id] !== question.correct_answer }"
            >
              <div class="answer-header">
                <div class="answer-status">
                  <span class="answer-emoji" *ngIf="results.answers[question.localId || question.id] === question.correct_answer">✅</span>
                  <span class="answer-emoji" *ngIf="results.answers[question.localId || question.id] !== question.correct_answer">❌</span>
                </div>
                <h4>{{ question.question }}</h4>
              </div>
              <div class="answer-details">
                <p><strong>Your Answer:</strong> {{ getAnswerLabelWithText(question, results.answers[question.localId || question.id]) || 'Not answered' }}</p>
                <p *ngIf="results.answers[question.localId || question.id] !== question.correct_answer">
                  <strong>Correct Answer:</strong> {{ getAnswerLabelWithText(question, question.correct_answer) || question.correct_answer }}
                </p>
                <p class="explanation"><strong>Explanation:</strong> {{ question.explanation }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button mat-raised-button class="action-button home-button" (click)="goHome()">
            🏠 Home
          </button>
          <button mat-raised-button class="action-button retake-button" (click)="retakeQuiz()">
            🔄 Retake Quiz
          </button>
        </div>
      </div>

      <ng-template #noResults>
        <div class="no-results">
          <div class="no-results-card">
            <p>No quiz results found. Please complete a quiz first.</p>
            <button mat-raised-button color="primary" class="start-button" (click)="goHome()">Start Quiz</button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  results: QuizResults | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    const resultsStr = sessionStorage.getItem('quizResults');
    if (resultsStr) {
      this.results = JSON.parse(resultsStr);
    }
  }

  getGrade(percentage: number): string {
    if (percentage >= 60) return 'pass';
    return 'fail';
  }

  getTitleByGrade(grade: string): string {
    const titles: { [key: string]: string } = {
      pass: 'Great Job!',
      fail: 'Keep Practicing'
    };
    return titles[grade] || 'Complete!';
  }

  getFeedback(percentage: number): string {
    if (percentage >= 60) return 'Great job! You have a strong understanding of this topic.';
    return 'Keep practicing! This topic needs more focus.';
  }

  goHome() {
    sessionStorage.removeItem('quizResults');
    this.router.navigate(['/']);
  }

  retakeQuiz() {
    if (this.results) {
      sessionStorage.removeItem('quizResults');
      this.router.navigate(['/quiz', this.results.topic]);
    }
  }

  getAnswerLabelWithText(question: any, answer: string | null): string | null {
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
}


