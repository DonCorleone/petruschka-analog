import { Component, inject } from '@angular/core';
import { BandDataService } from '../../core/services';

@Component({
  selector: 'app-music-section',
  standalone: true,
  templateUrl: './music-section.html',
  styleUrls: ['./music-section.css']
})
export class MusicSectionComponent {
  
  private bandDataService = inject(BandDataService);
  
  albums = this.bandDataService.albumsResource.value;
}
