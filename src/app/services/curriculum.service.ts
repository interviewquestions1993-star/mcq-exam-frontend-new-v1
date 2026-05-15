import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Chapter {
  id: string;
  name: string;
  chapterNumber?: number;
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface ClassCurriculum {
  classNumber: number;
  subjects: Subject[];
}

@Injectable({
  providedIn: 'root'
})
export class CurriculumService {
  private curriculumCache: ClassCurriculum[] | null = null;
  private curriculumLoading$ = new BehaviorSubject<boolean>(false);
  private curriculumLoaded$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  /**
   * Lazy-load curriculum data asynchronously
   */
  loadCurriculum(): Promise<ClassCurriculum[]> {
    // Return cached data if already loaded
    if (this.curriculumCache) {
      return Promise.resolve(this.curriculumCache);
    }

    // Prevent multiple concurrent loads
    if (this.curriculumLoading$.value) {
      return new Promise(resolve => {
        const subscription = this.curriculumLoaded$.subscribe(loaded => {
          if (loaded && this.curriculumCache) {
            subscription.unsubscribe();
            resolve(this.curriculumCache);
          }
        });
      });
    }

    this.curriculumLoading$.next(true);

    // Dynamically import the curriculum data
    return import('../data/ncert-curriculum')
      .then(module => {
        this.curriculumCache = module.NCERT_CURRICULUM || module.default;
        this.curriculumLoading$.next(false);
        this.curriculumLoaded$.next(true);
        return this.curriculumCache!;
      })
      .catch(error => {
        console.error('Error loading curriculum:', error);
        this.curriculumLoading$.next(false);
        throw error;
      });
  }

  /**
   * Get curriculum as observable
   */
  getCurriculum$(): Observable<ClassCurriculum[]> {
    return new Observable(observer => {
      this.loadCurriculum()
        .then(data => {
          observer.next(data);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  /**
   * Get subjects for a specific class
   */
  getSubjectsForClass$(classNumber: number): Observable<Subject[]> {
    return new Observable(observer => {
      this.loadCurriculum()
        .then(curriculum => {
          const classCurriculum = curriculum.find(c => c.classNumber === classNumber);
          if (classCurriculum) {
            observer.next(classCurriculum.subjects);
          } else {
            observer.next([]);
          }
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  /**
   * Get chapters for a specific subject in a class
   */
  getChaptersForSubject$(classNumber: number, subjectId: string): Observable<Chapter[]> {
    return new Observable(observer => {
      this.loadCurriculum()
        .then(curriculum => {
          const classCurriculum = curriculum.find(c => c.classNumber === classNumber);
          const subject = classCurriculum?.subjects.find(s => s.id === subjectId);
          if (subject) {
            observer.next(subject.chapters);
          } else {
            observer.next([]);
          }
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  /**
   * Check if curriculum is currently loading
   */
  isLoading$(): Observable<boolean> {
    return this.curriculumLoading$.asObservable();
  }

  /**
   * Force reload curriculum data
   */
  clearCache(): void {
    this.curriculumCache = null;
    this.curriculumLoaded$.next(false);
  }
}
