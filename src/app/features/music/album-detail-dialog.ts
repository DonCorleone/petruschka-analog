import { Component, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { DialogService } from '../../core/services/dialog.service';
import { Album } from '../../../shared/types';

export interface AlbumDetailData {
  album: Album;
}

@Component({
  selector: 'app-album-detail-dialog',
  imports: [CommonModule],
  templateUrl: './album-detail-dialog.html',
  styleUrls: ['./album-detail-dialog.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumDetailDialogComponent {
  public dialogRef = inject(DialogRef<boolean>);
  public data = inject(DIALOG_DATA) as AlbumDetailData;
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