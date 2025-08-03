import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { BandMember } from '../../../shared/types';

export interface MemberBioData {
  member: BandMember;
}

@Component({
  selector: 'app-member-bio-dialog',
  imports: [CommonModule],
  templateUrl: './member-bio-dialog.html',
  styleUrls: ['./member-bio-dialog.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberBioDialogComponent {
  public dialogRef = inject(DialogRef<boolean>);
  public data = inject(DIALOG_DATA) as MemberBioData;

  close(): void {
    this.dialogRef.close();
  }
}
