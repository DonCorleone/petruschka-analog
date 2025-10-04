import { Component, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { DialogService } from '../../core/services/dialog.service';
import { BaseDialogComponent } from '../../core/components/base-dialog.component';
import { DialogInfoSectionComponent } from '../../core/components/dialog-info-section.component';
import { DialogTwoColumnComponent } from '../../core/components/dialog-two-column.component';
import { Gig } from '../../../shared/types';

export interface GigDetailData {
  gig: Gig;
  isHistoryEvent?: boolean;
}

@Component({
  selector: 'app-gig-detail-dialog',
  imports: [
    CommonModule, 
    BaseDialogComponent, 
    DialogInfoSectionComponent, 
    DialogTwoColumnComponent
  ],
  templateUrl: './gig-detail-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GigDetailDialogComponent {
  public data = inject(DIALOG_DATA) as GigDetailData;
  private router = inject(Router);
  private dialogService = inject(DialogService);

  openLocationDialog(locationName: string): void {
    if (locationName && locationName !== '#') {
      this.dialogService.openLocationDetail(locationName);
    }
  }
}
