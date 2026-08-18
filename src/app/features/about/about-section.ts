import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { BandDataService } from '../../core/services';
import { DialogService } from '../../core/services/dialog.service';
import { BandMember } from '../../../shared/types';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { AnimateOnScrollDirective } from '../../shared/directives';

@Component({
  selector: 'app-about-section',
  imports: [TruncatePipe, AnimateOnScrollDirective],
  templateUrl: './about-section.html',
  styleUrls: ['./about-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutSectionComponent {
  
  private bandDataService = inject(BandDataService);
  private dialogService = inject(DialogService);
  
  bandMembers = this.bandDataService.bandMembersResource.value;

  openMemberBio(member: BandMember): void {
    this.dialogService.openMemberBio(member);
  }
}
