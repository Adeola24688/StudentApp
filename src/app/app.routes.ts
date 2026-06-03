import { Routes } from '@angular/router';
import { StudentsComponent } from './components/students/students';
import { StudentFormComponent } from './components/student-form/student-form';

export const routes: Routes = [
  { path: '', component: StudentsComponent },
  { path: 'add', component: StudentFormComponent },
  { path: 'edit/:id', component: StudentFormComponent },
];
