import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { ResultsComponent } from './pages/results/results.component';
import { TopicSelectionComponent } from './pages/topic-selection/topic-selection.component';
import { CbseComponent } from './pages/cbse/cbse.component';
import { CbseSubjectsComponent } from './pages/cbse-subjects/cbse-subjects.component';
import { CbseChaptersComponent } from './pages/cbse-chapters/cbse-chapters.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './pages/terms-of-service/terms-of-service.component';
import { PersistedMcqsComponent } from './pages/persisted-mcqs/persisted-mcqs.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'topics/:topic', component: TopicSelectionComponent },
  { path: 'cbse', component: CbseComponent },
  { path: 'cbse/:classNumber/subjects', component: CbseSubjectsComponent },
  { path: 'cbse/:classNumber/subjects/:subject/chapters', component: CbseChaptersComponent },
  { path: 'quiz/:topic', component: QuizComponent },
  { path: 'results', component: ResultsComponent },
  { path: 'persisted-mcqs', component: PersistedMcqsComponent, canActivate: [AuthGuard] },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'terms-of-service', component: TermsOfServiceComponent },
  { path: '**', redirectTo: '' }
];
