import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-two-column',
  imports: [CommonModule],
  template: `
    <div class="dialog-two-col">
      <div class="dialog-content-column">
        <ng-content select="[slot=content]"></ng-content>
      </div>
      <div class="dialog-image-column">
        <ng-content select="[slot=image]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .dialog-two-col {
      display: grid;
      grid-template-columns: 3fr 2fr;
      gap: 1.875rem;
    }

    .dialog-image-column img {
      width: 100%;
      height: auto;
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s ease;
    }

    .dialog-image-column img:hover {
      transform: scale(1.02);
    }

    /* Mobile responsive */
    @media (max-width: 767.98px) {
      .dialog-two-col {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }
      
      .dialog-image-column {
        order: -1; /* Show image first on mobile */
      }
      
      .dialog-image-column img {
        max-width: 300px;
        margin: 0 auto;
        display: block;
      }
    }
  `]
})
export class DialogTwoColumnComponent {}