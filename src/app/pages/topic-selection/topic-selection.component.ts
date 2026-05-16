import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

interface TopicConcept {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

@Component({
  selector: 'app-topic-selection',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule
  ],
  template: `
    <div class="topic-selection-container">
      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <button mat-icon-button class="back-button" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>Select {{ topicName }} Concepts</h1>
          <p class="subtitle">Choose the concepts you want to be quizzed on</p>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading concepts...</p>
      </div>

      <!-- Concepts List -->
      <div *ngIf="!isLoading && concepts.length > 0" class="concepts-section">
        <div class="concepts-grid">
          <mat-card *ngFor="let concept of concepts" class="concept-card" [class.selected]="concept.selected && !useCustomTopics" [class.disabled]="useCustomTopics">
            <mat-card-content>
              <div class="concept-header">
                <mat-checkbox
                  [(ngModel)]="concept.selected"
                  (change)="onConceptToggle(concept)"
                  [disabled]="useCustomTopics"
                  color="primary"
                ></mat-checkbox>
                <div class="concept-info">
                  <h3>{{ concept.name }}</h3>
                  <p>{{ concept.description }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Custom Topics Section -->
        <div class="custom-topics-section">
          <mat-card class="custom-topics-card">
            <mat-card-content>
              <div class="custom-topics-header">
                <mat-checkbox
                  [(ngModel)]="useCustomTopics"
                  (change)="onCustomTopicsToggle()"
                  color="primary"
                ></mat-checkbox>
                <div class="custom-topics-info">
                  <h3>Or specify your own topics</h3>
                  <p>Enter specific concepts or subtopics you want to focus on</p>
                </div>
              </div>
              <div class="custom-topics-input" *ngIf="useCustomTopics">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Enter your topics (comma-separated)</mat-label>
                  <textarea
                    matInput
                    [(ngModel)]="customTopics"
                    placeholder="e.g., Components, Services, Routing, Forms"
                    rows="3"
                  ></textarea>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Question Count Selector -->
        <div class="question-count-group">
          <label class="count-pill">
            <input
              type="radio"
              name="questionCount"
              [value]="5"
              [(ngModel)]="questionCount"
              class="count-input"
            />
            <div class="pill-content">
              <span class="pill-label">5 Questions</span>
              <span class="pill-subtitle">Default quick set</span>
            </div>
          </label>

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
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            mat-stroked-button
            color="primary"
            class="action-button select-all-button"
            (click)="selectAll()"
            [disabled]="useCustomTopics"
          >
            Select All
          </button>
          <button
            mat-stroked-button
            color="accent"
            class="action-button clear-all-button"
            (click)="clearAll()"
            [disabled]="useCustomTopics"
          >
            Clear All
          </button>
          <button
            mat-raised-button
            color="primary"
            class="action-button start-quiz-button"
            [disabled]="(!useCustomTopics && selectedConcepts.length === 0) || (useCustomTopics && !customTopics.trim())"
            (click)="startQuiz()"
          >
            Start Quiz
            <span *ngIf="useCustomTopics && customTopics.trim()"> (Custom Topics)</span>
            <span *ngIf="!useCustomTopics && selectedConcepts.length > 0"> ({{ selectedConcepts.length }} concepts)</span>
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="!isLoading && concepts.length === 0 && error" class="error-state">
        <mat-card>
          <div class="error-content">
            <mat-icon class="error-icon">error_outline</mat-icon>
            <h2>Failed to Load Concepts</h2>
            <p>{{ error }}</p>
            <button mat-raised-button color="primary" (click)="loadConcepts()">
              Try Again
            </button>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./topic-selection.component.css']
})
export class TopicSelectionComponent implements OnInit {
  topicName = '';
  concepts: TopicConcept[] = [];
  isLoading = false;
  error = '';
  useCustomTopics = false;
  customTopics = '';
  questionCount = 5;

  get selectedConcepts(): TopicConcept[] {
    return this.concepts.filter(c => c.selected);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.topicName = this.route.snapshot.paramMap.get('topic') || '';
    this.loadConcepts();
  }

  loadConcepts() {
    this.isLoading = true;
    this.error = '';

    const normalizedTopicName = this.topicName.trim().toLowerCase();

    // Mock concepts data - in a real app, this would come from an API
    const mockConcepts: { [key: string]: TopicConcept[] } = {
      'Angular': [
        { id: '1', name: 'Components', description: 'Building blocks of Angular applications', selected: false },
        { id: '2', name: 'Directives', description: 'Custom HTML attributes and elements', selected: false },
        { id: '3', name: 'Services', description: 'Reusable business logic and data management', selected: false },
        { id: '4', name: 'Routing', description: 'Navigation between different views', selected: false },
        { id: '5', name: 'Forms', description: 'Template-driven and reactive forms', selected: false },
        { id: '6', name: 'HTTP Client', description: 'Making API calls and handling responses', selected: false },
        { id: '7', name: 'RxJS', description: 'Reactive programming with observables', selected: false },
        { id: '8', name: 'Dependency Injection', description: 'Managing dependencies and services', selected: false }
      ],
      'React': [
        { id: '1', name: 'Components', description: 'Reusable UI building blocks', selected: false },
        { id: '2', name: 'JSX', description: 'JavaScript syntax extension for UI', selected: false },
        { id: '3', name: 'State Management', description: 'Managing component state and data flow', selected: false },
        { id: '4', name: 'Hooks', description: 'useState, useEffect, and custom hooks', selected: false },
        { id: '5', name: 'Props', description: 'Passing data between components', selected: false },
        { id: '6', name: 'Lifecycle Methods', description: 'Component lifecycle and side effects', selected: false },
        { id: '7', name: 'Context API', description: 'Global state management', selected: false },
        { id: '8', name: 'React Router', description: 'Client-side routing', selected: false }
      ],
      'Python': [
        { id: '1', name: 'Data Types', description: 'Variables, strings, numbers, and collections', selected: false },
        { id: '2', name: 'Control Flow', description: 'Conditionals, loops, and exception handling', selected: false },
        { id: '3', name: 'Functions', description: 'Defining and using functions', selected: false },
        { id: '4', name: 'Classes', description: 'Object-oriented programming concepts', selected: false },
        { id: '5', name: 'Modules', description: 'Importing and using external libraries', selected: false },
        { id: '6', name: 'File I/O', description: 'Reading and writing files', selected: false },
        { id: '7', name: 'List Comprehensions', description: 'Advanced list operations', selected: false },
        { id: '8', name: 'Decorators', description: 'Modifying function behavior', selected: false }
      ],
      'JavaScript': [
        { id: '1', name: 'Variables', description: 'var, let, and const declarations', selected: false },
        { id: '2', name: 'Functions', description: 'Function declarations and expressions', selected: false },
        { id: '3', name: 'Objects', description: 'Object literals and prototypes', selected: false },
        { id: '4', name: 'Arrays', description: 'Array methods and manipulation', selected: false },
        { id: '5', name: 'DOM Manipulation', description: 'Interacting with HTML elements', selected: false },
        { id: '6', name: 'Event Handling', description: 'Responding to user interactions', selected: false },
        { id: '7', name: 'Promises', description: 'Asynchronous programming', selected: false },
        { id: '8', name: 'ES6+ Features', description: 'Modern JavaScript syntax and features', selected: false }
      ],
      'TypeScript': [
        { id: '1', name: 'Type Annotations', description: 'Adding types to variables and functions', selected: false },
        { id: '2', name: 'Interfaces', description: 'Defining object shapes and contracts', selected: false },
        { id: '3', name: 'Classes', description: 'Object-oriented programming with types', selected: false },
        { id: '4', name: 'Generics', description: 'Reusable code with type parameters', selected: false },
        { id: '5', name: 'Modules', description: 'Organizing code with imports/exports', selected: false },
        { id: '6', name: 'Decorators', description: 'Metadata and runtime behavior modification', selected: false },
        { id: '7', name: 'Union Types', description: 'Multiple possible types for a value', selected: false },
        { id: '8', name: 'Type Guards', description: 'Runtime type checking', selected: false }
      ],
      'Machine Learning': [
        { id: '1', name: 'Supervised Learning', description: 'Learning from labeled data', selected: false },
        { id: '2', name: 'Unsupervised Learning', description: 'Finding patterns in unlabeled data', selected: false },
        { id: '3', name: 'Neural Networks', description: 'Deep learning fundamentals', selected: false },
        { id: '4', name: 'Data Preprocessing', description: 'Cleaning and preparing data', selected: false },
        { id: '5', name: 'Model Evaluation', description: 'Measuring model performance', selected: false },
        { id: '6', name: 'Feature Engineering', description: 'Creating meaningful input features', selected: false },
        { id: '7', name: 'Overfitting', description: 'Preventing models from memorizing training data', selected: false },
        { id: '8', name: 'Gradient Descent', description: 'Optimization algorithm fundamentals', selected: false }
      ],
      'Data Science': [
        { id: '1', name: 'Statistics', description: 'Descriptive and inferential statistics', selected: false },
        { id: '2', name: 'Data Visualization', description: 'Creating charts and graphs', selected: false },
        { id: '3', name: 'Data Cleaning', description: 'Handling missing values and outliers', selected: false },
        { id: '4', name: 'Exploratory Analysis', description: 'Understanding data distributions', selected: false },
        { id: '5', name: 'Pandas', description: 'Data manipulation and analysis', selected: false },
        { id: '6', name: 'NumPy', description: 'Numerical computing with arrays', selected: false },
        { id: '7', name: 'SQL', description: 'Database querying and manipulation', selected: false },
        { id: '8', name: 'Data Ethics', description: 'Responsible data handling practices', selected: false }
      ],
      'Artificial Intelligence': [
        { id: '1', name: 'Search Algorithms', description: 'Finding optimal solutions', selected: false },
        { id: '2', name: 'Knowledge Representation', description: 'Modeling information and reasoning', selected: false },
        { id: '3', name: 'Machine Learning', description: 'Learning from data and patterns', selected: false },
        { id: '4', name: 'Natural Language Processing', description: 'Understanding and generating human language', selected: false },
        { id: '5', name: 'Computer Vision', description: 'Image and video analysis', selected: false },
        { id: '6', name: 'Expert Systems', description: 'Rule-based decision making', selected: false },
        { id: '7', name: 'Robotics', description: 'AI in physical systems', selected: false },
        { id: '8', name: 'Ethics in AI', description: 'Responsible AI development and deployment', selected: false }
      ],
      'NEET': [
        { id: '1', name: 'Biology: Diversity & Anatomy', description: 'Diversity in living organisms and structural organisation in plants and animals', selected: false },
        { id: '2', name: 'Biology: Cell Biology & Genetics', description: 'Cell structure, cell cycle, heredity, Mendelian genetics, and human genetics', selected: false },
        { id: '3', name: 'Biology: Physiology', description: 'Plant physiology, human physiology, nutrition, and health biology', selected: false },
        { id: '4', name: 'Biology: Ecology & Environment', description: 'Ecosystems, biodiversity, conservation, and human welfare topics', selected: false },
        { id: '5', name: 'Biology: Biotechnology', description: 'Biotechnology, its applications, and modern genetics tools', selected: false },
        { id: '6', name: 'Chemistry: Physical Chemistry', description: 'Basic concepts, thermodynamics, equilibrium, kinetics, and solutions', selected: false },
        { id: '7', name: 'Chemistry: Inorganic Chemistry', description: 'Periodic table, chemical bonding, coordination compounds, and environmental chemistry', selected: false },
        { id: '8', name: 'Chemistry: Organic Chemistry', description: 'Hydrocarbons, functional groups, biomolecules, and reaction mechanisms', selected: false },
        { id: '9', name: 'Physics: Mechanics & Thermodynamics', description: 'Kinematics, laws of motion, work/energy, gravitation, and thermal physics', selected: false },
        { id: '10', name: 'Physics: Electricity & Magnetism', description: 'Electrostatics, current electricity, magnetism, and electromagnetic induction', selected: false },
        { id: '11', name: 'Physics: Optics & Modern Physics', description: 'Ray optics, wave optics, dual nature of matter, atoms and nuclei', selected: false },
        { id: '12', name: 'NEET Exam Strategy', description: 'High-yield revision, diagram practice, formula recall, and last-minute exam tips', selected: false }
      ]
    };

    // Simulate API call delay
    setTimeout(() => {
      const matchedKey = Object.keys(mockConcepts).find(
        key => key.toLowerCase() === normalizedTopicName
      );

      this.concepts = matchedKey ? mockConcepts[matchedKey] : [];
      this.isLoading = false;

      if (this.concepts.length === 0) {
        this.error = 'No concepts found for this topic.';
      }
    }, 1000);
  }

  onConceptToggle(concept: TopicConcept) {
    // Optional: Add any logic when a concept is toggled
  }

  selectAll() {
    this.concepts.forEach(concept => concept.selected = true);
  }

  clearAll() {
    this.concepts.forEach(concept => concept.selected = false);
  }

  onCustomTopicsToggle() {
    if (this.useCustomTopics) {
      // Clear all concept selections when switching to custom topics
      this.concepts.forEach(concept => concept.selected = false);
    } else {
      // Clear custom topics when switching back to predefined concepts
      this.customTopics = '';
    }
  }

  startQuiz() {
    let quizTopic = this.topicName;

    if (this.useCustomTopics && this.customTopics.trim()) {
      // Use custom topics
      quizTopic = `${this.topicName}: ${this.customTopics.trim()}`;
    } else if (this.selectedConcepts.length > 0) {
      // Use selected concepts
      const selectedConceptNames = this.selectedConcepts.map(c => c.name);
      quizTopic = `${this.topicName}: ${selectedConceptNames.join(', ')}`;
    } else {
      this.snackBar.open('Please select concepts or specify custom topics to start the quiz.', 'Close', {
        duration: 3000
      });
      return;
    }

    this.router.navigate(['/quiz', quizTopic], {
      queryParams: { count: this.questionCount }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}