import { Component, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { DialogService } from '../../core/services/dialog.service';
import { MerchItem } from '../../../shared/types';

export interface MerchDetailData {
  merchItem: MerchItem;
}

@Component({
  selector: 'app-merch-detail-dialog',
  imports: [CommonModule],
  templateUrl: './merch-detail-dialog.html',
  styleUrls: ['./merch-detail-dialog.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchDetailDialogComponent {
  public dialogRef = inject(DialogRef<boolean>);
  public data = inject(DIALOG_DATA) as MerchDetailData;
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