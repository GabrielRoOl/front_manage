import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface AlertData {
  id: string;
  type: 'error' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
}

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'alert alert-' + alert.type">
      <div class="alert-icon">{{ getIcon() }}</div>
      <div class="alert-content">
        <p class="alert-title">{{ alert.title }}</p>
        <p class="alert-message">{{ alert.message }}</p>
      </div>
      <button class="alert-close" (click)="onClose()">✕</button>
    </div>
  `,
  styles: [`
    .alert {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid;
      align-items: flex-start;
      animation: slideInAlert 0.3s ease;
    }

    .alert-error {
      background: #ffebee;
      border-left-color: #b00020;
      color: #b00020;
    }

    .alert-success {
      background: #e8f5e9;
      border-left-color: #4caf50;
      color: #4caf50;
    }

    .alert-warning {
      background: #fff3e0;
      border-left-color: #ff9800;
      color: #ff9800;
    }

    .alert-info {
      background: #e3f2fd;
      border-left-color: #2196f3;
      color: #2196f3;
    }

    .alert-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }

    .alert-content {
      flex: 1;
    }

    .alert-title {
      margin: 0 0 0.25rem 0;
      font-weight: 700;
      font-size: 0.95rem;
    }

    .alert-message {
      margin: 0;
      font-size: 0.85rem;
      line-height: 1.5;
      word-break: break-word;
      opacity: 0.9;
    }

    .alert-close {
      background: none;
      border: none;
      padding: 0;
      font-size: 1.2rem;
      cursor: pointer;
      flex-shrink: 0;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .alert-close:hover {
      opacity: 1;
    }

    @keyframes slideInAlert {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class AlertComponent {
  @Input() alert!: AlertData;
  @Output() close = new EventEmitter<string>();

  getIcon(): string {
    switch (this.alert.type) {
      case 'error':
        return '⚠️';
      case 'success':
        return '✓';
      case 'warning':
        return '⚡';
      case 'info':
        return 'ℹ️';
      default:
        return '•';
    }
  }

  onClose(): void {
    this.close.emit(this.alert.id);
  }
}
