import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-info-section',
  imports: [CommonModule],
  template: `
    <div class="dialog-info-section">
      <h4>{{ title }}</h4>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .dialog-info-section {
      margin-bottom: 1.5rem;
    }

    .dialog-info-section h4 {
      color: var(--primary-color);
      font-weight: 600;
      margin-bottom: 0.75rem;
      border-bottom: 2px solid var(--primary-color);
      padding-bottom: 0.25rem;
      font-size: 1.125rem;
    }

    .dialog-info-section p {
      margin-bottom: 0.5rem;
      line-height: 1.6;
    }

    .dialog-info-section strong {
      color: #555;
      font-weight: 600;
    }

    .dialog-info-section .lead {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--text-dark);
      margin-bottom: 1rem;
    }
  `]
})
export class DialogInfoSectionComponent {
  @Input() title: string = '';
}