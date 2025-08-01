import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { GigDetailDialogComponent, GigDetailData } from '../../features/gigs/gig-detail-dialog';
import { Gig, PastEvent, ApiResponse } from '../../../shared/types';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private currentDialogRef: DialogRef<boolean> | null = null;
  private isDialogOpening = false;

  constructor(
    private dialog: Dialog,
    private router: Router,
    private http: HttpClient
  ) {}

  async openGigDetail(gig: Gig): Promise<void> {
    // Prevent double-opening
    if (this.isDialogOpening) {
      return;
    }
    
    this.isDialogOpening = true;
    
    try {
      // Close any existing dialog first
      if (this.currentDialogRef) {
        this.currentDialogRef.close();
      }

    // Update URL for SEO and deep linking
    this.router.navigate(['/gig', gig.id], { replaceUrl: false });
    
    let gigData: Gig = gig; // Default to basic gig data
    
    try {
      console.log(`🔄 Loading detailed gig data for: ${gig.title} (ID: ${gig.id})`);
      
      // Fetch detailed gig data from API
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Gig>>(`/api/v1/gig/${gig.id}`)
      );
      
      if (response.success && response.data) {
        gigData = response.data;
        console.log(`✅ Loaded detailed gig data for: ${gigData.title}`);
      } else {
        throw new Error('Failed to load gig details');
      }
      
    } catch (error) {
      console.error('Error loading gig details:', error);
      console.log('⚠️ Falling back to basic gig data');
      // gigData remains as the basic gig data
    }
    
    // Open dialog with either detailed or basic data
    this.currentDialogRef = this.dialog.open<boolean>(GigDetailDialogComponent, {
      data: { gig: gigData } as GigDetailData,
      panelClass: 'custom-dialog-panel',
      backdropClass: 'custom-dialog-backdrop',
      hasBackdrop: true,
      disableClose: false,
      autoFocus: false,
      restoreFocus: true,
      closeOnNavigation: true
    });

    // Handle dialog close - navigate back to home (single subscription)
    this.currentDialogRef.closed.subscribe(() => {
      console.log('Gig dialog closed, navigating home');
      this.currentDialogRef = null;
      this.router.navigate(['/'], { replaceUrl: true });
    });
    
    } finally {
      // Reset the opening flag after a short delay
      setTimeout(() => {
        this.isDialogOpening = false;
      }, 300);
    }
  }

  closeCurrentDialog(): void {
    console.log('closeCurrentDialog called', { hasDialog: !!this.currentDialogRef });
    if (this.currentDialogRef) {
      this.currentDialogRef.close();
    }
  }

  openHistoryDetail(event: PastEvent): void {
    // Close any existing dialog first
    if (this.currentDialogRef) {
      this.currentDialogRef.close();
    }

    // Update URL for SEO and deep linking
    this.router.navigate(['/history', event.id], { replaceUrl: false });
    
    // Transform PastEvent to Gig-like structure for dialog
    const gigData: Gig = {
      id: parseInt(event.id) || 0,
      title: event.title,
      date: {
        day: parseInt(event.date.split('.')[0]) || 0,
        month: this.getMonthFromDate(event.date)
      },
      venue: 'Historische Aufführung',
      location: 'Verschiedene Orte',
      time: 'Siehe Beschreibung',
      dayOfWeek: 'Historisch',
      description: event.description,
      ticketUrl: '#' // No tickets for past events
    };
    
    this.currentDialogRef = this.dialog.open<boolean>(GigDetailDialogComponent, {
      data: { gig: gigData, isHistoryEvent: true } as GigDetailData & { isHistoryEvent: boolean },
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
      console.log('History dialog closed, navigating home');
      this.currentDialogRef = null;
      this.router.navigate(['/'], { replaceUrl: true });
    });
  }

  private getMonthFromDate(dateStr: string): string {
    // Extract month from date string like "15.04.2023"
    const parts = dateStr.split('.');
    if (parts.length >= 2) {
      const monthNum = parseInt(parts[1]);
      const months = ['', 'JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 
                     'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'];
      return months[monthNum] || 'UNK';
    }
    return 'UNK';
  }
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
