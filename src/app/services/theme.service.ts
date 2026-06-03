import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private key = 'theme';
  private themeSubject = new BehaviorSubject<Theme>(this.getInitialTheme());
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.apply(this.themeSubject.value);
  }

  private getInitialTheme(): Theme {
    try {
      const stored = localStorage.getItem(this.key) as Theme | null;
      return stored === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  toggle() {
    const next: Theme = this.themeSubject.value === 'dark' ? 'light' : 'dark';
    this.apply(next);
  }

  setTheme(theme: Theme) {
    this.apply(theme);
  }

  private apply(theme: Theme) {
    this.themeSubject.next(theme);
    try {
      localStorage.setItem(this.key, theme);
    } catch {}

    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
  }
}
