import { Component, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { BaseDialogComponent } from '../../core/components/base-dialog.component';
import { DialogInfoSectionComponent } from '../../core/components/dialog-info-section.component';
import { DialogTwoColumnComponent } from '../../core/components/dialog-two-column.component';
import { DialogService } from '../../core/services/dialog.service';
import { MerchItem } from '../../../shared/types';

export interface MerchDetailData {
  merchItem: MerchItem;
}

@Component({
  selector: 'app-merch-detail-dialog',
  imports: [
    CommonModule, 
    BaseDialogComponent, 
    DialogInfoSectionComponent, 
    DialogTwoColumnComponent
  ],
  templateUrl: './merch-detail-dialog.html',
  styleUrls: ['./merch-detail-dialog.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchDetailDialogComponent {
  public data = inject(DIALOG_DATA) as MerchDetailData;
  private router = inject(Router);
  private dialogService = inject(DialogService);

  openLocationDialog(locationName: string): void {
    if (locationName && locationName !== '#') {
      this.dialogService.openLocationDetail(locationName);
    }
  }
}