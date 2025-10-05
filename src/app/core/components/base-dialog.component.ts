import { Component, inject, Input, TemplateRef, ViewChild, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-base-dialog',
  imports: [CommonModule],
  template: `
    <div class="dialog-container d-block overflow-hidden rounded">
      <div class="dialog-header d-flex justify-content-between align-items-center p-4 border-bottom">
        <h2 class="dialog-title fw-bold m-0">{{ title }}</h2>
        <button 
          type="button" 
          class="btn-close btn btn-xs btn-ghost-secondary dialog-close-btn" 
          aria-label="Dialog schliessen"
          (click)="close()">
          <i class="fa-solid fa-times" aria-hidden="true"></i>
          <span class="visually-hidden">×</span>
        </button>
      </div>

      <div class="dialog-content p-4 overflow-y-auto">
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