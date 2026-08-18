import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { BandDataService, DialogService } from '../../core/services';
import { Album } from '../../../shared/types';
import { AnimateOnScrollDirective } from '../../shared/directives';

@Component({
  selector: 'app-music-section',
  templateUrl: './music-section.html',
  styleUrls: ['./music-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnimateOnScrollDirective]
})
export class MusicSectionComponent {
  
  private bandDataService = inject(BandDataService);
  private dialogService = inject(DialogService);
  
  albums = this.bandDataService.albumsResource.value;
  
  openAlbumDetail(album: Album): void {
    if (album) {
      this.dialogService.openAlbumDetail(album);
    }
  }
}
