import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { DialogService } from '../../core/services/dialog.service';
import { Gig } from '../../../shared/types';

export interface GigDetailData {
  gig: Gig;
  isHistoryEvent?: boolean;
}

@Component({
  selector: 'app-gig-detail-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gig-detail-dialog.html',
  styleUrls: ['./gig-detail-dialog.css']
})
export class GigDetailDialogComponent {
  constructor(
    public dialogRef: DialogRef<boolean>,
    @Inject(DIALOG_DATA) public data: GigDetailData,
    private router: Router,
    private dialogService: DialogService
  ) {}

  close(): void {
    console.log('Dialog close called', { isHistoryEvent: this.data.isHistoryEvent });
    this.dialogService.closeCurrentDialog();
  }
}
