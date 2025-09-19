import { Injectable } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GigDataService } from './gig-data.service';
import { GigDetailDialogComponent, GigDetailData } from '../../features/gigs/gig-detail-dialog';
import { MemberBioDialogComponent, MemberBioData } from '../../features/about/member-bio-dialog';
import { LocationDialogComponent, LocationDialogData } from '../../features/location/location-dialog';
import { AlbumDetailDialogComponent, AlbumDetailData } from '../../features/music/album-detail-dialog';
import { MerchDetailDialogComponent, MerchDetailData } from '../../features/merch/merch-detail-dialog';
import { Gig, PastEvent, BandMember, Location, Album, MerchItem, ApiResponse } from '../../../shared/types';

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
      
      // Try to extract detailed gig from client-side template data (no API call needed!)
      try {
        // Get template ID from numeric ID
        let templateId: string | number;
        // Use the startTimestamp from the gig object if available
        let targetTimestamp: number | null = gig.startTimestamp || null;
        
        // Legacy ID handling for backward compatibility
        const gigIdStr = String(gig.id);
        if (gigIdStr.includes('_')) {
          const parts = gigIdStr.split('_');
          templateId = parts[0];
          if (!targetTimestamp) {
            targetTimestamp = parseInt(parts[1]);
          }
        } else {
          // Legacy numeric ID or simple template ID
          const numericId = parseInt(gigIdStr);
          templateId = isNaN(numericId) ? gigIdStr : numericId;
        }
        
        console.log('Looking up gig details with:', { 
          templateId, 
          targetTimestamp, 
          ticketUrl: gig.ticketUrl 
        });
        
        // Extract detailed gig from stored template data
        const detailedGig = this.gigDataService.extractDetailedGig(templateId, targetTimestamp);
        
        if (detailedGig) {
          // Make sure we preserve the specific ticketUrl from the event
          gigData = {
            ...detailedGig,
            ticketUrl: gig.ticketUrl // Always use the event-specific ticket URL
          };
        } else {
          throw new Error('Template not found in client-side data');
        }
        
      } catch (error) {
        // Last resort: Try to find a template by name
        try {
          const templates = this.gigDataService.getGigTemplates();
          const templateByName = templates.find(t => t.name === gig.title);
          
          if (templateByName) {
            // Use the startTimestamp from the gig object or fallback
            const timestamp = gig.startTimestamp || Date.now();
            
            // Try extraction again with the found template
            const detailedGigByName = this.gigDataService.extractDetailedGig(templateByName._id, timestamp);
            
            if (detailedGigByName) {
              gigData = {
                ...detailedGigByName,
                ticketUrl: gig.ticketUrl // Always use the event-specific ticket URL
              };
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
              gigData = {
                ...response.data,
                ticketUrl: gig.ticketUrl // Always use the event-specific ticket URL
              };
            } else {
              throw new Error('Failed to load gig details from API');
            }
          } catch (apiError) {
            // Silent catch - continue with basic gig data
          }
        }
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
    if (this.currentDialogRef) {
      this.currentDialogRef.close();
    }
  }

  async openHistoryDetail(event: PastEvent): Promise<void> {
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

  private getYearFromDate(dateStr: string): number {
    // Extract year from date string like "15.04.2023"
    const parts = dateStr.split('.');
    if (parts.length >= 3) {
      return parseInt(parts[2]) || new Date().getFullYear();
    }
    return new Date().getFullYear();
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
      
      // Fetch location data from API
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Location>>(`/api/v1/location/${encodeURIComponent(locationName)}`)
      );
      
      if (!response.success || !response.data) {
        throw new Error('Failed to load location details');
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

      // Handle dialog close
      this.currentDialogRef.closed.subscribe(() => {
        this.currentDialogRef = null;
      });
      
    } catch (error) {
      // Silent catch
    } finally {
      // Reset the opening flag after a short delay
      setTimeout(() => {
        this.isDialogOpening = false;
      }, 300);
    }
  }
  
  async openAlbumDetail(album: Album): Promise<void> {
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
      
      let albumData: Album = album; // Default to basic album data
      
      // Try to find the corresponding gig for this album in the gig templates
      try {
        // Get all gig templates
        const templates = this.gigDataService.getGigTemplates();
        
        // Find a template that matches this album (by ID or title)
        // Look for templates that have a "CD" ticketType or googleAnalyticsTracker
        const matchingTemplate = templates.find(t => 
          t._id === album.id.toString() || 
          t.name === album.title || 
          (t.googleAnalyticsTracker && t.googleAnalyticsTracker.includes('CD'))
        );
        
        if (matchingTemplate) {
          console.log('Found matching gig template for album:', matchingTemplate);
          
          // Create a pseudo-timestamp if needed for the extraction
          const fakeTimestamp = Date.now();
          
          // Extract detailed gig from the template
          const detailedGig = this.gigDataService.extractDetailedGig(matchingTemplate._id, fakeTimestamp);
          
          if (detailedGig) {
            // Find the CD ticket type to extract artists information
            const cdTicket = detailedGig.ticketTypes?.find(t => 
              t.name === "CD" || t.name === "Hörspiel"
            );
            
            // Convert gig data to album data format
            albumData = {
              ...albumData,
              description: detailedGig.longDescription || detailedGig.description,
              releaseDate: detailedGig.eventDateString,
              // Use the CD ticket description as artists info instead of the gig's artists field
              artists: cdTicket?.description || detailedGig.artists,
              // Include notification email for order process
              notificationEmail: detailedGig.notificationEmail || matchingTemplate.notificationEmail || '',
              // Extract tracks if available in the gig data
              tracks: detailedGig.ticketTypes?.filter(t => 
                t.name !== "CD" && // Filter out the CD ticket type itself
                t.name !== "Hörspiel" &&
                !t.name.includes("Versand") && // Filter out shipping options
                !t.name.includes("Postversand") &&
                !t.name.includes("Abo")
              ).map(t => ({ 
                title: t.name, 
                duration: t.description || '' 
              })) || []
            };
            console.log('Enhanced album data with gig template details:', albumData);
          }
        } else {
          console.log('No matching gig template found for album:', album);
        }
      } catch (error) {
        console.error('Error finding album details in gig templates:', error);
      }
      
      // Open dialog with either detailed or basic data
      this.currentDialogRef = this.dialog.open<boolean>(AlbumDetailDialogComponent, {
        data: { album: albumData } as AlbumDetailData,
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
        this.currentDialogRef = null;
      });
      
    } catch (error) {
      // Silent catch
    } finally {
      // Reset the opening flag after a short delay
      setTimeout(() => {
        this.isDialogOpening = false;
      }, 300);
    }
  }
  
  async openMerchDetail(merchItem: MerchItem): Promise<void> {
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
      
      let merchData: MerchItem = merchItem; // Default to basic merch data
      
      // Try to find the corresponding gig for Tournee merchandise in gig templates
      try {
        // Get all gig templates
        const templates = this.gigDataService.getGigTemplates();
        
        // Find a template that matches this merch (by ID or title)
        // Look for templates that have a "Tournee" in the googleAnalyticsTracker
        const matchingTemplate = templates.find(t => 
          t._id === merchItem.id.toString() || 
          t.name === merchItem.title || 
          (t.googleAnalyticsTracker && t.googleAnalyticsTracker.includes('Tournee'))
        );
        
        if (matchingTemplate) {
          console.log('Found matching gig template for merch item:', matchingTemplate);
          
          // Create a pseudo-timestamp if needed for the extraction
          const fakeTimestamp = Date.now();
          
          // Extract detailed gig from the template
          const detailedGig = this.gigDataService.extractDetailedGig(matchingTemplate._id, fakeTimestamp);
          
          if (detailedGig) {
            // Extract performance dates if available
            const performanceDates: string[] = [];
            
            if (detailedGig.eventDateString) {
              performanceDates.push(detailedGig.eventDateString);
            }
            
            // Extract additional details
            const details: string[] = [];
            if (detailedGig.duration) details.push(`Dauer: ${detailedGig.duration}`);
            if (detailedGig.venue) details.push(`Ort: ${detailedGig.venue}`);
            if (detailedGig.artists) details.push(`Künstler: ${detailedGig.artists}`);
            if (detailedGig.importantNotes) details.push(detailedGig.importantNotes);
            
            // Convert gig data to merch data format
            merchData = {
              ...merchData,
              longDescription: detailedGig.longDescription || detailedGig.description,
              details: details.length > 0 ? details : undefined,
              performanceDates: performanceDates.length > 0 ? performanceDates : undefined,
              notificationEmail: detailedGig.notificationEmail || matchingTemplate.notificationEmail || '',
              type: 'tournee'
            };
            
            console.log('Enhanced merch data with gig template details:', merchData);
          }
        } else {
          console.log('No matching gig template found for merch item:', merchItem);
        }
      } catch (error) {
        console.error('Error finding merch details in gig templates:', error);
      }
      
      // Open dialog with either detailed or basic data
      this.currentDialogRef = this.dialog.open<boolean>(MerchDetailDialogComponent, {
        data: { merchItem: merchData } as MerchDetailData,
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
        this.currentDialogRef = null;
      });
      
    } catch (error) {
      // Silent catch
    } finally {
      // Reset the opening flag after a short delay
      setTimeout(() => {
        this.isDialogOpening = false;
      }, 300);
    }
  }
}
