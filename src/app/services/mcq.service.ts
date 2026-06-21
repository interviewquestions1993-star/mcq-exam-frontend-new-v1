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
  message?: string;
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
  user_id?: string;
  user_email?: string;
  user_name?: string;
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
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/api/mcq/generate`;
  }

  private getCbseApiUrl(): string {
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/api/mcq/cbse`;
  }

  generateQuestions(topic: string, numQuestions: number = 5, difficulty?: string): Observable<MCQResponse> {
    const lowerTopic = (topic || '').toLowerCase();
    const isCbseTopic = lowerTopic.includes('cbse') || lowerTopic.includes('ncert') || lowerTopic.includes('english grammar');
    const payload: any = {
      topic,
      num_questions: numQuestions,
      difficulty: difficulty || null
    };

    if (numQuestions < 0) {
      if (isCbseTopic) {
        payload.num_questions = -1;
      } else {
        // For generic topic generation, use the maximum supported question count
        payload.num_questions = 50;
      }
    }

    if (isCbseTopic) {
      return this.http.post<MCQResponse>(this.getCbseApiUrl(), payload);
    }

    if (lowerTopic.includes('science') && lowerTopic.includes('cbse')) {
      payload.source = 'https://ncert.nic.in/textbook.php?hecu1=0-13';
    } else if (lowerTopic.includes('cbse') || lowerTopic.includes('ncert')) {
      payload.source = 'NCERT, DIKSHA(https://diksha.gov.in/search/Library/)';
    }

    return this.http.post<MCQResponse>(this.getApiUrl(), payload);
  }

  saveQuizHistory(record: QuizHistoryRecord): Observable<any> {
    const apiUrl = `${this.getBaseUrl()}/api/mcq/history`;
    return this.http.post(apiUrl, record);
  }
}
