import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { BandDataService } from '../../core/services';

@Component({
  selector: 'app-music-section',
  templateUrl: './music-section.html',
  styleUrls: ['./music-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MusicSectionComponent {
  
  private bandDataService = inject(BandDataService);
  
  albums = this.bandDataService.albumsResource.value;
}
