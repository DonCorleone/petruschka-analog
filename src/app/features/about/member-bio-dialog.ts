import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { BaseDialogComponent } from '../../core/components/base-dialog.component';
import { DialogInfoSectionComponent } from '../../core/components/dialog-info-section.component';
import { DialogTwoColumnComponent } from '../../core/components/dialog-two-column.component';
import { BandMember } from '../../../shared/types';

export interface MemberBioData {
  member: BandMember;
}

@Component({
  selector: 'app-member-bio-dialog',
  imports: [
    CommonModule, 
    BaseDialogComponent, 
    DialogInfoSectionComponent, 
    DialogTwoColumnComponent
  ],
  templateUrl: './member-bio-dialog.html',
  styleUrls: ['./member-bio-dialog.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberBioDialogComponent {
  public data = inject(DIALOG_DATA) as MemberBioData;
}
