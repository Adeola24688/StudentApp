import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';
import { StudentService, Student } from '../../services/student';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './student-form.html',
  styleUrl: './student-form.css',
})
export class StudentFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.studentService.getStudent(Number(id)).subscribe((data) => {
        this.form.patchValue(data);
      });
    }
  }

  initializeForm(): void {
    this.form = this.fb.group({
      id: [0],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,}$/)]],
    });
  }

  get firstName() {
    return this.form.get('firstName');
  }

  get lastName() {
    return this.form.get('lastName');
  }

  get email() {
    return this.form.get('email');
  }

  get phone() {
    return this.form.get('phone');
  }

  saveStudent(): void {
    if (!this.form.valid) {
      this.notificationService.error('Please fill out all fields correctly');
      return;
    }

    this.isSubmitting = true;
    const studentData = this.form.value;

    if (this.isEditMode) {
      this.studentService.updateStudent(studentData.id, studentData).subscribe({
        next: () => {
          this.notificationService.success('Student updated successfully');
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error updating student:', error);
          this.isSubmitting = false;
        },
      });
    } else {
      this.studentService.addStudent(studentData).subscribe({
        next: () => {
          this.notificationService.success('Student added successfully');
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error adding student:', error);
          this.isSubmitting = false;
        },
      });
    }
  }
}
