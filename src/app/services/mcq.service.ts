import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
  localId?: string;
}

export interface MCQResponse {
  topic: string;
  num_questions: number;
  questions: MCQQuestion[];
  status: string;
}

export interface QuizHistoryRecord {
  topic: string;
  num_questions: number;
  questions: MCQQuestion[];
  answers: { [key: string]: string };
  score: number;
  total: number;
  percentage: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class MCQService {
  constructor(private http: HttpClient) {}

  private getBaseUrl(): string {
    return (window as any).__API_URL__ || 'https://mcq-exam-backend-new-v1.onrender.com';
  }

  private getApiUrl(): string {
    // Use environment variable for deployed version, fallback to Render backend if not set
    const baseUrl = (window as any).__API_URL__ || 'https://mcq-exam-backend-new-v1.onrender.com';
    return `${baseUrl}/api/mcq/generate`;
  }

  generateQuestions(topic: string, numQuestions: number = 5, difficulty?: string): Observable<MCQResponse> {
    const payload = {
      topic,
      num_questions: numQuestions,
      difficulty: difficulty || null
    };
    return this.http.post<MCQResponse>(this.getApiUrl(), payload);
  }

  saveQuizHistory(record: QuizHistoryRecord): Observable<any> {
    const apiUrl = `${this.getBaseUrl()}/api/mcq/history`;
    return this.http.post(apiUrl, record);
  }
}
