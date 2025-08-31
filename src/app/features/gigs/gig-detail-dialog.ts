import { Component, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
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
  imports: [CommonModule],
  templateUrl: './gig-detail-dialog.html',
  styleUrls: ['./gig-detail-dialog.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GigDetailDialogComponent {
  public dialogRef = inject(DialogRef<boolean>);
  public data = inject(DIALOG_DATA) as GigDetailData;
  private router = inject(Router);
  private dialogService = inject(DialogService);

  close(): void {
    this.dialogRef.close();
  }

  openLocationDialog(locationName: string): void {
    if (locationName && locationName !== '#') {
      this.dialogService.openLocationDetail(locationName);
    }
  }
}
