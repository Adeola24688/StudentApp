import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          if (error.status === 0) {
            errorMessage = 'Cannot connect to the server. Please check your connection.';
          } else if (error.status === 404) {
            errorMessage = 'Resource not found (404)';
          } else if (error.status === 500) {
            errorMessage = 'Server error (500). Please try again later.';
          } else if (error.status === 400) {
            errorMessage = `Bad request (400): ${error.error?.message || 'Invalid data'}`;
          } else {
            errorMessage = `Error ${error.status}: ${error.statusText || 'Unknown error'}`;
          }
        }

        this.notificationService.error(errorMessage);
        return throwError(() => error);
      }),
    );
  }
}
