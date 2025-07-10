import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BandDataService } from '../../core/services';

@Component({
  selector: 'app-music-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './music-section.html',
  styleUrls: ['./music-section.css']
})
export class MusicSectionComponent {
  
  private bandDataService = inject(BandDataService);
  
  albums = this.bandDataService.albumsResource.value;
}
