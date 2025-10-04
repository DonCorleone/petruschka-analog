import { Component, inject, Input, TemplateRef, ViewChild, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-base-dialog',
  imports: [CommonModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ title }}</h2>
        <button 
          type="button" 
          class="btn-close btn btn-xs btn-ghost-secondary dialog-close-btn" 
          aria-label="Dialog schliessen"
          (click)="close()">
          <i class="fa-solid fa-times" aria-hidden="true"></i>
          <span class="sr-only">×</span>
        </button>
      </div>

      <div class="dialog-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./base-dialog.component.css']
})
export class BaseDialogComponent {
  @Input() title: string = '';
  
  public dialogRef = inject(DialogRef<boolean>);

  close(): void {
    this.dialogRef.close();
  }
}