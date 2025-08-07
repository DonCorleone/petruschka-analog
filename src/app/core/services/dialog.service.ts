import { Injectable } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GigDetailDialogComponent, GigDetailData } from '../../features/gigs/gig-detail-dialog';
import { MemberBioDialogComponent, MemberBioData } from '../../features/about/member-bio-dialog';
import { LocationDialogComponent, LocationDialogData } from '../../features/location/location-dialog';
import { Gig, PastEvent, BandMember, Location, ApiResponse } from '../../../shared/types';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private currentDialogRef: DialogRef<boolean> | null = null;
  private isDialogOpening = false;

  constructor(
    private dialog: Dialog,
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
        height: '200px',
        width: '90vw',
        panelClass: 'custom-dialog-panel',
        backdropClass: 'custom-dialog-backdrop',
        hasBackdrop: true,
        disableClose: false,
        autoFocus: false,
        restoreFocus: true,
        closeOnNavigation: false // No navigation involved

      });

      // Handle dialog close - simple cleanup
      this.currentDialogRef.closed.subscribe(() => {
        console.log('Gig dialog closed');
        this.currentDialogRef = null;
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

  async openHistoryDetail(event: PastEvent): Promise<void> {

    console.log('event data:', JSON.stringify(event));
    // Close any existing dialog first
    if (this.currentDialogRef) {
      this.currentDialogRef.close();
    }
    
    // Transform PastEvent to Gig-like structure for dialog (basic data)
    let gigData: Gig = {
      id: parseInt(event.id) || 0,
      title: event.title,
      date: {
        day: parseInt(this.getDayFromDate(event.date)),
        month: this.getMonthFromDate(event.date)
      },
      time: '20:00',
      dayOfWeek: '',
      venue: 'Petruschka Theater',
      location: 'Petruschka Theater',
      description: event.description || '',
      ticketUrl: '#'
    };

    try {
      console.log(`🔄 Loading detailed past event data for: ${event.title} (ID: ${event.id})`);
      
      // Fetch detailed past event data from API
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Gig>>(`/api/v1/past-event/${event.id}`)
      );
      
      if (response.success && response.data) {
        gigData = response.data;
        console.log(`✅ Loaded detailed past event data for: ${gigData.title}`);
      } else {
        throw new Error('Failed to load past event details');
      }
      
    } catch (error) {
      console.error('Error loading past event details:', error);
      console.log('⚠️ Falling back to basic past event data');
      // gigData remains as the basic past event data
    }

    // Open dialog with either detailed or basic data
    this.currentDialogRef = this.dialog.open<boolean>(GigDetailDialogComponent, {
      data: { gig: gigData, isHistoryEvent: true } as GigDetailData,
      panelClass: 'custom-dialog-panel',
      backdropClass: 'custom-dialog-backdrop',
      hasBackdrop: true,
      disableClose: false,
      autoFocus: false,
      restoreFocus: true,
      closeOnNavigation: false
    });

    // Handle dialog close
    this.currentDialogRef.closed.subscribe(() => {
      console.log('History dialog closed');
      this.currentDialogRef = null;
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

  private getDayFromDate(dateStr: string): string {
    // Extract day from date string like "15.04.2023"
    const parts = dateStr.split('.');
    if (parts.length >= 1) {
      return parts[0];
    }
    return '01';
  }

  openMemberBio(member: BandMember): void {
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
      
      // Open member bio dialog
      this.currentDialogRef = this.dialog.open<boolean>(MemberBioDialogComponent, {
        data: { member } as MemberBioData,
        panelClass: 'custom-dialog-panel',
        backdropClass: 'custom-dialog-backdrop',
        hasBackdrop: true,
        disableClose: false,
        autoFocus: false,
        restoreFocus: true,
        closeOnNavigation: false
      });

      // Handle dialog close
      this.currentDialogRef.closed.subscribe(() => {
        console.log('Member bio dialog closed');
        this.currentDialogRef = null;
      });
      
    } finally {
      // Reset the opening flag after a short delay
      setTimeout(() => {
        this.isDialogOpening = false;
      }, 300);
    }
  }

  async openLocationDetail(locationName: string): Promise<void> {
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
      
      console.log(`🔄 Loading location data for: ${locationName}`);
      
      // Fetch location data from API
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Location>>(`/api/v1/location/${encodeURIComponent(locationName)}`)
      );
      
      if (!response.success || !response.data) {
        throw new Error('Failed to load location details');
      }
      
      console.log(`✅ Loaded location data for: ${response.data.name}`);
      
      // Open location dialog
      this.currentDialogRef = this.dialog.open<boolean>(LocationDialogComponent, {
        data: { location: response.data } as LocationDialogData,
        panelClass: 'custom-dialog-panel',
        backdropClass: 'custom-dialog-backdrop',
        hasBackdrop: true,
        disableClose: false,
        autoFocus: false,
        restoreFocus: true,
        closeOnNavigation: false
      });

      // Handle dialog close
      this.currentDialogRef.closed.subscribe(() => {
        console.log('Location dialog closed');
        this.currentDialogRef = null;
      });
      
    } catch (error) {
      console.error('Error loading location details:', error);
      // Could show a toast notification here
    } finally {
      // Reset the opening flag after a short delay
      setTimeout(() => {
        this.isDialogOpening = false;
      }, 300);
    }
  }
}
