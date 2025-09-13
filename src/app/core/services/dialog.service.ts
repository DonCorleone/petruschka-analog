import { Injectable } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GigDataService } from './gig-data.service';
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
    private http: HttpClient,
    private gigDataService: GigDataService
  ) {}

  async openGigDetail(gig: Gig): Promise<DialogRef<boolean> | null> {
    // Prevent double-opening
    if (this.isDialogOpening) {
      return null;
    }
    
    this.isDialogOpening = true;
    
    // Safety check for gig object
    if (!gig || !gig.id) {
      this.isDialogOpening = false;
      console.error('Invalid gig object provided to openGigDetail');
      return null;
    }
    
    try {
      // Close any existing dialog first
      if (this.currentDialogRef) {
        this.currentDialogRef.close();
      }
    
      let gigData: Gig = gig; // Default to basic gig data
      
      // Try to extract detailed gig from client-side template data (no API call needed!)
      try {
        // Parse composite ID (format: "templateId_timestamp" or just templateId)
        let templateId: string | number;
        let targetTimestamp: number | null = null;
        
        const gigIdStr = String(gig.id);
        if (gigIdStr.includes('_')) {
          const parts = gigIdStr.split('_');
          templateId = parts[0];
          targetTimestamp = parseInt(parts[1]);
        } else {
          // Legacy numeric ID or simple template ID
          const numericId = parseInt(gigIdStr);
          templateId = isNaN(numericId) ? gigIdStr : numericId;
        }
        
        // Extract detailed gig from stored template data
        const detailedGig = this.gigDataService.extractDetailedGig(templateId, targetTimestamp);
        
        if (detailedGig) {
          gigData = detailedGig;
        } else {
          throw new Error('Template not found in client-side data');
        }
        
      } catch (error) {
        // Last resort: Try to find a template by name
        try {
          const templates = this.gigDataService.getGigTemplates();
          const templateByName = templates.find(t => t.name === gig.title);
          
          if (templateByName) {
            // Create a pseudo-timestamp if needed for the extraction
            const fakeTimestamp = Date.now();
            
            // Try extraction again with the found template
            const detailedGigByName = this.gigDataService.extractDetailedGig(templateByName._id, fakeTimestamp);
            
            if (detailedGigByName) {
              gigData = detailedGigByName;
            }
          }
        } catch (nameMatchError) {
          // Silent catch - continue with fallback
        }
        
        // If still no detailed data, fallback to API
        if (!gigData.longDescription) {
          try {
            const response = await firstValueFrom(
              this.http.get<ApiResponse<Gig>>(`/api/v1/gig/${gig.id}`)
            );
            
            if (response.success && response.data) {
              gigData = response.data;
            } else {
              throw new Error('Failed to load gig details from API');
            }
          } catch (apiError) {
            // Silent catch - continue with basic gig data
          }
        }
      }
      
      // Ensure artists field is populated with default content if missing
      if (!gigData.artists) {
        // Try to find a template with the same name to get artists info
        try {
          const templates = this.gigDataService.getGigTemplates();
          const matchingTemplate = templates.find(t => t.name === gigData.title);
          
          if (matchingTemplate && matchingTemplate.artists) {
            gigData.artists = matchingTemplate.artists;
          } else {
            // Default artists information
            gigData.artists = "Puppenspiel: Claudia Baran\nRegie: Claudia Baran";
          }
        } catch (error) {
          // Silent catch - use default
          gigData.artists = "Puppenspiel: Claudia Baran\nRegie: Claudia Baran";
        }
      }
      
      // Update the URL for deeplinking if we're not already on the detail page
      // Check if we are already on the detail page (to prevent redundant history manipulation)
      const currentPath = window.location.pathname;
      const expectedPath = `/gig/${gig.id}`;
      
      if (!currentPath.includes(expectedPath)) {
        // Update the URL without triggering navigation
        const url = `/gig/${gig.id}`;
        window.history.pushState({ gigId: gig.id }, '', url);
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
        closeOnNavigation: false
      });

      // Handle dialog close - clean up and restore history if needed
      this.currentDialogRef.closed.subscribe(() => {
        this.currentDialogRef = null;
        
        // Check if we should go back in history
        // Only go back if we're on a detail page and there's history to go back to
        if (window.location.pathname.includes('/gig/') && 
            window.history.length > 1 && 
            document.referrer) {
          window.history.back();
        }
      });
      
      // Store reference to return
      const dialogRef = this.currentDialogRef;
      return dialogRef;
      
    } catch (error) {
      // Silent catch for any errors
      return null;
    } finally {
      // Reset the opening flag after a short delay
      setTimeout(() => {
        this.isDialogOpening = false;
      }, 300);
    }
  }

  closeCurrentDialog(): void {
    if (this.currentDialogRef) {
      this.currentDialogRef.close();
    }
  }

  async openHistoryDetail(event: PastEvent): Promise<DialogRef<boolean> | null> {
    // Prevent double-opening
    if (this.isDialogOpening) {
      return null;
    }
    
    this.isDialogOpening = true;
    
    try {
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
        month: this.getMonthFromDate(event.date),
        year: this.getYearFromDate(event.date)
      },
      time: '20:00',
      dayOfWeek: '',
      venue: 'Petruschka Theater',
      location: 'Petruschka Theater',
      description: event.description || '',
      ticketUrl: '#'
    };

    try {
      // Try to extract detailed past event from client-side template data (no API call needed!)
      const detailedPastEvent = this.gigDataService.extractDetailedPastEvent(event.id);
      
      if (detailedPastEvent) {
        gigData = detailedPastEvent;
      }
    } catch (error) {
      // Silent catch - use basic data
    }

    // Ensure artists field is populated with default content if missing
    if (!gigData.artists) {
      // Try to find a template with the same name to get artists info
      try {
        const templates = this.gigDataService.getGigTemplates();
        const matchingTemplate = templates.find(t => t.name === gigData.title);
        
        if (matchingTemplate && matchingTemplate.artists) {
          gigData.artists = matchingTemplate.artists;
        } else {
          // Default artists information for history events
          gigData.artists = "Puppenspiel: Claudia Baran\nRegie: Claudia Baran";
        }
      } catch (error) {
        // Silent catch - use default
        gigData.artists = "Puppenspiel: Claudia Baran\nRegie: Claudia Baran";
      }
    }

    // Update the URL for deeplinking if we're not already on the detail page
    // Check if we are already on the detail page (to prevent redundant history manipulation)
    const currentPath = window.location.pathname;
    const expectedPath = `/history/${event.id}`;
    
    if (!currentPath.includes(expectedPath)) {
      // Update the URL without triggering navigation
      const url = `/history/${event.id}`;
      window.history.pushState({ historyEventId: event.id }, '', url);
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

    // Handle dialog close - clean up and restore history if needed
    this.currentDialogRef.closed.subscribe(() => {
      this.currentDialogRef = null;
      
      // Check if we should go back in history
      // Only go back if we're on a detail page and there's history to go back to
      if (window.location.pathname.includes('/history/') && 
          window.history.length > 1 && 
          document.referrer) {
        window.history.back();
      }
    });
    
    // Store reference to return
    const dialogRef = this.currentDialogRef;
    return dialogRef;
      
  } catch (error) {
    // Silent catch for any errors
    return null;
  } finally {
    // Reset the opening flag after a short delay
    setTimeout(() => {
      this.isDialogOpening = false;
    }, 300);
  }
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

  private getYearFromDate(dateStr: string): number {
    // Extract year from date string like "15.04.2023"
    const parts = dateStr.split('.');
    if (parts.length >= 3) {
      return parseInt(parts[2]) || new Date().getFullYear();
    }
    return new Date().getFullYear();
  }

  openMemberBio(member: BandMember): DialogRef<boolean> | null {
    // Prevent double-opening
    if (this.isDialogOpening) {
      return null;
    }
    
    this.isDialogOpening = true;
    
    try {
      // Close any existing dialog first
      if (this.currentDialogRef) {
        this.currentDialogRef.close();
      }
      
      // Format the member name for URL
      const formattedName = member.name
        .toLowerCase()
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/[äöüÄÖÜ]/g, c => {  // Handle umlauts
          switch(c) {
            case 'ä': return 'ae';
            case 'ö': return 'oe';
            case 'ü': return 'ue';
            case 'Ä': return 'ae';
            case 'Ö': return 'oe';
            case 'Ü': return 'ue';
            default: return c;
          }
        })
        .replace(/[^a-z0-9-]/g, ''); // Remove special chars except hyphens

      // Update the URL for deeplinking if we're not already on the detail page
      const currentPath = window.location.pathname;
      const expectedPath = `/member/${formattedName}`;
      
      if (!currentPath.includes(expectedPath)) {
        // Update the URL without triggering navigation
        const url = `/member/${formattedName}`;
        window.history.pushState({ memberName: member.name }, '', url);
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

      // Handle dialog close - clean up and restore history if needed
      this.currentDialogRef.closed.subscribe(() => {
        this.currentDialogRef = null;
        
        // Check if we should go back in history
        if (window.location.pathname.includes('/member/') && 
            window.history.length > 1 && 
            document.referrer) {
          window.history.back();
        }
      });
      
      // Store reference to return
      const dialogRef = this.currentDialogRef;
      return dialogRef;
      
    } catch (error) {
      // Silent catch for any errors
      return null;
    } finally {
      // Reset the opening flag after a short delay
      setTimeout(() => {
        this.isDialogOpening = false;
      }, 300);
    }
  }

  async openLocationDetail(locationName: string): Promise<DialogRef<boolean> | null> {
    // Prevent double-opening
    if (this.isDialogOpening) {
      return null;
    }
    
    this.isDialogOpening = true;
    
    try {
      // Close any existing dialog first
      if (this.currentDialogRef) {
        this.currentDialogRef.close();
      }
      
      // Fetch location data from API
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Location>>(`/api/v1/location/${encodeURIComponent(locationName)}`)
      );
      
      if (!response.success || !response.data) {
        throw new Error('Failed to load location details');
      }
      
      // Format location name for URL
      const formattedName = locationName
        .toLowerCase()
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/[äöüÄÖÜ]/g, c => {  // Handle umlauts
          switch(c) {
            case 'ä': return 'ae';
            case 'ö': return 'oe';
            case 'ü': return 'ue';
            case 'Ä': return 'ae';
            case 'Ö': return 'oe';
            case 'Ü': return 'ue';
            default: return c;
          }
        })
        .replace(/[^a-z0-9-]/g, ''); // Remove special chars except hyphens
      
      // Update the URL for deeplinking if we're not already on the detail page
      const currentPath = window.location.pathname;
      const expectedPath = `/location/${formattedName}`;
      
      if (!currentPath.includes(expectedPath)) {
        // Update the URL without triggering navigation
        const url = `/location/${formattedName}`;
        window.history.pushState({ locationName: locationName }, '', url);
      }

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

      // Handle dialog close - clean up and restore history if needed
      this.currentDialogRef.closed.subscribe(() => {
        this.currentDialogRef = null;
        
        // Check if we should go back in history
        if (window.location.pathname.includes('/location/') && 
            window.history.length > 1 && 
            document.referrer) {
          window.history.back();
        }
      });
      
      // Store reference to return
      const dialogRef = this.currentDialogRef;
      return dialogRef;
      
    } catch (error) {
      // Silent catch
      return null;
    } finally {
      // Reset the opening flag after a short delay
      setTimeout(() => {
        this.isDialogOpening = false;
      }, 300);
    }
  }
}
