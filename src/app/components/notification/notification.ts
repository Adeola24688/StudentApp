import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div
        *ngFor="let notification of notifications"
        [class]="'notification notification-' + notification.type"
        [@slideIn]
      >
        <span class="notification-message">{{ notification.message }}</span>
        <button class="notification-close" (click)="removeNotification(notification.id)">×</button>
      </div>
    </div>
  `,
  styles: `
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
    }

    .notification {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    }

    .notification-success {
      background-color: #4caf50;
    }

    .notification-error {
      background-color: #f44336;
    }

    .notification-info {
      background-color: #2196f3;
    }

    .notification-warning {
      background-color: #ff9800;
    }

    .notification-message {
      flex: 1;
      margin-right: 10px;
    }

    .notification-close {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      transition: opacity 0.2s;
    }

    .notification-close:hover {
      opacity: 0.8;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .notification-container {
        right: 15px;
        left: 15px;
        top: 15px;
        max-width: none;
      }

      .notification {
        padding: 14px;
        margin-bottom: 10px;
        border-radius: 4px;
        font-size: 13px;
      }

      .notification-message {
        margin-right: 8px;
      }

      .notification-close {
        font-size: 22px;
      }
    }

    @media (max-width: 480px) {
      .notification-container {
        right: 10px;
        left: 10px;
        top: 10px;
      }

      .notification {
        padding: 12px;
        margin-bottom: 8px;
        font-size: 12px;
      }

      .notification-message {
        margin-right: 6px;
      }

      .notification-close {
        font-size: 20px;
      }
    }
  `,
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification) => {
        this.notifications.push(notification);

        if (notification.duration) {
          setTimeout(() => {
            this.removeNotification(notification.id);
          }, notification.duration);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeNotification(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }
}
