import { Injectable, inject } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { GigDetailDialogComponent, GigDetailData } from '../../features/gigs/gig-detail-dialog';
import { Gig } from '../../../shared/types';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private currentDialogRef: DialogRef<boolean> | null = null;

  constructor(
    private dialog: Dialog,
    private router: Router
  ) {}

  openGigDetail(gig: Gig): void {
    // Close any existing dialog first
    if (this.currentDialogRef) {
      this.currentDialogRef.close();
    }

    // Update URL for SEO and deep linking
    this.router.navigate(['/gig', gig.id], { replaceUrl: false });
    
    this.currentDialogRef = this.dialog.open<boolean>(GigDetailDialogComponent, {
      data: { gig } as GigDetailData,
      panelClass: 'custom-dialog-panel',
      backdropClass: 'custom-dialog-backdrop',
      hasBackdrop: true,
      disableClose: false,
      autoFocus: false,
      restoreFocus: true,
      closeOnNavigation: true
    });

    // Handle dialog close - navigate back to home
    this.currentDialogRef.closed.subscribe(() => {
      this.currentDialogRef = null;
      this.router.navigate(['/'], { replaceUrl: true });
    });
  }

  closeCurrentDialog(): void {
    if (this.currentDialogRef) {
      this.currentDialogRef.close();
    }
  }

  // Future methods for other dialog types
  openAlbumDetail(albumId: number): void {
    // TODO: Implement album detail dialog
    this.router.navigate(['/album', albumId]);
  }

  openFullBio(): void {
    // TODO: Implement full bio dialog
    this.router.navigate(['/about']);
  }

  openBookingForm(): void {
    // TODO: Implement booking form dialog
    this.router.navigate(['/book']);
  }
}
