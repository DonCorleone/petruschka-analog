import { Component, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { BaseDialogComponent } from '../../core/components/base-dialog.component';
import { DialogInfoSectionComponent } from '../../core/components/dialog-info-section.component';
import { DialogTwoColumnComponent } from '../../core/components/dialog-two-column.component';
import { DialogService } from '../../core/services/dialog.service';
import { Album } from '../../../shared/types';

export interface AlbumDetailData {
  album: Album;
}

@Component({
  selector: 'app-album-detail-dialog',
  imports: [
    CommonModule, 
    BaseDialogComponent, 
    DialogInfoSectionComponent, 
    DialogTwoColumnComponent
  ],
  templateUrl: './album-detail-dialog.html',
  styleUrls: ['./album-detail-dialog.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumDetailDialogComponent {
  public data = inject(DIALOG_DATA) as AlbumDetailData;
  private router = inject(Router);
  private dialogService = inject(DialogService);

  openLocationDialog(locationName: string): void {
    if (locationName && locationName !== '#') {
      this.dialogService.openLocationDetail(locationName);
    }
  }
}