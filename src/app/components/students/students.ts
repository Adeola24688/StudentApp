import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StudentService, Student } from '../../services/student';
import { NotificationService } from '../../services/notification';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

type SortColumn = 'firstName' | 'lastName' | 'email' | 'phone';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class StudentsComponent implements OnInit, OnDestroy {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  paginatedStudents: Student[] = [];
  searchQuery: string = '';
  isLoading = false;
  private destroy$ = new Subject<void>();

  sortColumn: SortColumn = 'firstName';
  sortDirection: SortDirection = 'asc';

  itemsPerPage = 5;
  currentPage = 1;
  totalPages = 1;

  constructor(
    private studentService: StudentService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadStudents();
    // Subscribe to refresh events
    this.studentService
      .getStudentsRefresh()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadStudents());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.studentService.getStudents().subscribe({
      next: (data) => {
        console.log('Students loaded:', data);
        this.students = data;
        this.applyFilterAndSort();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.students = [];
        this.isLoading = false;
      },
    });
  }

  searchStudents(): void {
    this.applyFilterAndSort();
  }

  private applyFilterAndSort(): void {
    let result = this.students;

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(
        (student) =>
          student.firstName.toLowerCase().includes(query) ||
          student.lastName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query),
      );
    }

    this.filteredStudents = result.sort((a, b) => {
      const aValue = a[this.sortColumn]?.toString().toLowerCase() || '';
      const bValue = b[this.sortColumn]?.toString().toLowerCase() || '';

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  sortStudents(column: SortColumn, direction?: SortDirection): void {
    if (direction) {
      this.sortDirection = direction;
    } else {
      this.sortDirection =
        this.sortColumn === column && this.sortDirection === 'asc' ? 'desc' : 'asc';
    }
    this.sortColumn = column;
    this.applyFilterAndSort();
  }

  getSortIndicator(column: SortColumn): string {
    if (this.sortColumn !== column) return '';
    return this.sortDirection === 'asc' ? ' ▲' : ' ▼';
  }

  deleteStudent(id: number): void {
    if (confirm('Are you sure you want to delete this student?')) {
      this.studentService.deleteStudent(id).subscribe({
        next: () => {
          this.notificationService.success('Student deleted successfully');
          this.loadStudents();
        },
        error: () => {
          this.notificationService.error('Failed to delete student');
        },
      });
    }
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredStudents.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedStudents = this.filteredStudents.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
