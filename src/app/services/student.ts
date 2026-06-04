import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private apiUrl = `${environment.apiBaseUrl}/students`;
  private studentsRefresh = new Subject<void>();

  constructor(private http: HttpClient) {}

  getStudentsRefresh(): Observable<void> {
    return this.studentsRefresh.asObservable();
  }

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);
  }

  getStudent(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  addStudent(student: Student): Observable<Student> {
    return this.http
      .post<Student>(this.apiUrl, student)
      .pipe(tap(() => this.studentsRefresh.next()));
  }

  updateStudent(id: number, student: Student): Observable<Student> {
    return this.http
      .put<Student>(`${this.apiUrl}/${id}`, student)
      .pipe(tap(() => this.studentsRefresh.next()));
  }

  deleteStudent(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.studentsRefresh.next()));
  }
}
