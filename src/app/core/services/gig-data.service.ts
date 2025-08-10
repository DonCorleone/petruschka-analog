import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Gig } from '../../../shared/types';

interface GigTemplate {
  _id: string | number;
  name: string;
  location?: string;
  url?: string;
  artists?: string;
  shortDescription?: string;
  longDescription?: string;
  flyerImagePath?: string;
  bannerImagePath?: string;
  imageUrl?: string;
  importantNotes?: string;
  googleAnalyticsTracker?: string;
  premiereDate?: Date | string;
  ticketDetails?: Array<{
    name: string;
    price: number;
    currency: string;
    imageUrl?: string;
  }>;
  eventDates?: Array<{
    start: Date | string | { $date: string };
    end?: Date | string | { $date: string };
    eventDateString?: string;
    googleAnalyticsTracker?: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class GigDataService {
  private gigTemplatesSubject = new BehaviorSubject<GigTemplate[]>([]);
  public gigTemplates$ = this.gigTemplatesSubject.asObservable();

  constructor() {}

  /**
   * Store SSR-loaded gig templates data
   */
  setGigTemplates(templates: GigTemplate[]): void {
    this.gigTemplatesSubject.next(templates);
  }

  /**
   * Get all stored gig templates
   */
  getGigTemplates(): GigTemplate[] {
    return this.gigTemplatesSubject.value;
  }

  /**
   * Find a specific gig template by ID
   */
  getGigTemplate(templateId: string | number): GigTemplate | null {
    const templates = this.getGigTemplates();
    return templates.find(template => 
      template._id === templateId || 
      template._id === String(templateId) || 
      String(template._id) === String(templateId)
    ) || null;
  }

  /**
   * Extract detailed gig from template data and specific event date
   * This replaces the server-side extractDetailedGigFromView function
   */
  extractDetailedGig(templateId: string | number, targetTimestamp?: number | null): Gig | null {
    const template = this.getGigTemplate(templateId);
    if (!template) return null;

    // Skip if no basic info
    if (!template.name || !template.eventDates || template.eventDates.length === 0) return null;
    
    // Find the specific event date if timestamp provided, otherwise use first upcoming
    let selectedEventDate: any = null;
    
    if (targetTimestamp) {
      // Find event date matching the timestamp
      selectedEventDate = template.eventDates.find((eventDate: any) => {
        const eventTime = eventDate.start instanceof Date 
          ? eventDate.start.getTime()
          : eventDate.start?.$date 
            ? new Date(eventDate.start.$date).getTime()
            : new Date(eventDate.start).getTime();
        return Math.abs(eventTime - targetTimestamp) < 1000; // Allow 1 second tolerance
      });
    }
    
    // If no specific date found, use first upcoming event
    if (!selectedEventDate) {
      const now = new Date();
      selectedEventDate = template.eventDates.find((eventDate: any) => {
        const eventTime = eventDate.start instanceof Date 
          ? eventDate.start
          : eventDate.start?.$date 
            ? new Date(eventDate.start.$date)
            : new Date(eventDate.start);
        return eventTime > now;
      }) || template.eventDates[0]; // Fallback to first if none upcoming
    }
    
    if (!selectedEventDate) return null;
    
    // Parse event date
    let eventDate: Date | null = null;
    if (selectedEventDate.start instanceof Date) {
      eventDate = selectedEventDate.start;
    } else if (selectedEventDate.start?.$date) {
      eventDate = new Date(selectedEventDate.start.$date);
    } else if (typeof selectedEventDate.start === 'string') {
      eventDate = new Date(selectedEventDate.start);
    }
    
    if (!eventDate || isNaN(eventDate.getTime())) return null;
    
    // Extract pricing information from pre-processed ticket details
    let ticketUrl = template.url || '#';
    if (ticketUrl && !ticketUrl.startsWith('http')) {
      ticketUrl = 'https://' + ticketUrl;
    }
    
    // Format date components
    const dayOfWeek = eventDate.toLocaleDateString('de-DE', { weekday: 'long' });
    const day = eventDate.getDate();
    const month = eventDate.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase();
    const year = eventDate.getFullYear();
    const time = eventDate.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    // Build enhanced description from pre-processed ticket details
    let description = template.shortDescription || 'Ein musikalisches Märchen vom Figurentheater PETRUSCHKA';
    
    // Extract ticket types with detailed information from view data
    const ticketTypes = template.ticketDetails?.map((ticket: any) => ({
      name: ticket.name || 'Ticket',
      price: ticket.price || 0,
      currency: ticket.currency || 'CHF',
      description: ''
    })) || [];

    // Calculate duration if end time is available
    let duration = '';
    if (selectedEventDate.end) {
      let endDate: Date | null = null;
      if (selectedEventDate.end instanceof Date) {
        endDate = selectedEventDate.end;
      } else if (selectedEventDate.end?.$date) {
        endDate = new Date(selectedEventDate.end.$date);
      } else if (typeof selectedEventDate.end === 'string') {
        endDate = new Date(selectedEventDate.end);
      }
      
      if (endDate && !isNaN(endDate.getTime())) {
        const durationMs = endDate.getTime() - eventDate.getTime();
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (durationHours > 0) {
          duration = `ca. ${durationHours}h${durationMinutes > 0 ? ` ${durationMinutes}min` : ''}`;
        } else if (durationMinutes > 0) {
          duration = `ca. ${durationMinutes}min`;
        }
      }
    }
    
    // Generate numeric ID for this specific event
    let eventId: number;
    if (typeof template._id === 'number') {
      eventId = template._id;
    } else if (typeof template._id === 'string') {
      const hash = template._id.split('').reduce((hash: number, char: string) => {
        return char.charCodeAt(0) + (hash << 6) + (hash << 16) - hash;
      }, 0);
      const timeComponent = Math.floor(eventDate.getTime() / 1000) % 10000;
      eventId = Math.abs(hash) % 100000 + timeComponent;
    } else {
      eventId = Math.floor(Math.random() * 1000000);
    }
    
    return {
      id: eventId,
      date: { day, month, year },
      title: template.name,
      venue: template.location || 'Venue TBA',
      location: template.location || 'Location TBA', 
      time: time,
      dayOfWeek: dayOfWeek,
      description: description,
      ticketUrl: ticketUrl,
      // Enhanced fields from optimized view data
      longDescription: template.longDescription || '',
      shortDescription: template.shortDescription || '',
      artists: template.artists || '',
      flyerImagePath: template.flyerImagePath || '',
      bannerImagePath: template.bannerImagePath || '',
      eventDateString: selectedEventDate.eventDateString || eventDate.toLocaleDateString('de-DE', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      ticketTypes: ticketTypes,
      duration: duration,
      ageRecommendation: template.shortDescription?.match(/ab (\d+) Jahr/)?.[0] || '',
      importantNotes: template.importantNotes || ''
    };
  }

  /**
   * Extract detailed past event from template data using premiere date
   * This replaces the server-side extractDetailedPastEventFromView function
   */
  extractDetailedPastEvent(eventId: string): Gig | null {
    const template = this.getGigTemplate(eventId);
    if (!template) return null;

    // Skip if no basic info or premiere date
    if (!template.name || !template.premiereDate) return null;
    
    // Parse premiere date
    let eventDate: Date | null = null;
    if (template.premiereDate instanceof Date) {
      eventDate = template.premiereDate;
    } else if (typeof template.premiereDate === 'object' && (template.premiereDate as any)?.$date) {
      eventDate = new Date((template.premiereDate as any).$date);
    } else if (typeof template.premiereDate === 'string') {
      eventDate = new Date(template.premiereDate);
    }
    
    if (!eventDate || isNaN(eventDate.getTime())) return null;
    
    // Extract pricing information from pre-processed data
    let ticketUrl = template.url || '#';
    if (ticketUrl && !ticketUrl.startsWith('http')) {
      ticketUrl = 'https://' + ticketUrl;
    }
    
    // Format date components
    const dayOfWeek = eventDate.toLocaleDateString('de-DE', { weekday: 'long' });
    const day = eventDate.getDate();
    const month = eventDate.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase();
    const year = eventDate.getFullYear();
    const time = eventDate.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    // Build basic description for past events
    let description = template.shortDescription || 'Ein vergangenes musikalisches Märchen vom Figurentheater PETRUSCHKA';
    
    // Extract ticket types with detailed information from pre-processed data
    const ticketTypes = template.ticketDetails?.map((ticket: any) => ({
      name: ticket.name || 'Ticket',
      price: ticket.price || 0,
      currency: ticket.currency || 'CHF',
      description: ''
    })) || [];

    // Calculate duration from event dates if available
    let duration = '';
    const eventDateInfo = template.eventDates?.find((ed: any) => {
      const edStart = ed.start instanceof Date ? ed.start : new Date(ed.start);
      return Math.abs(edStart.getTime() - eventDate!.getTime()) < 86400000; // Within 1 day
    });
    
    if (eventDateInfo && eventDateInfo.end) {
      let endDate: Date | null = null;
      if (eventDateInfo.end instanceof Date) {
        endDate = eventDateInfo.end;
      } else if (typeof eventDateInfo.end === 'object' && (eventDateInfo.end as any)?.$date) {
        endDate = new Date((eventDateInfo.end as any).$date);
      } else if (typeof eventDateInfo.end === 'string') {
        endDate = new Date(eventDateInfo.end);
      }
      
      if (endDate && !isNaN(endDate.getTime())) {
        const durationMs = endDate.getTime() - eventDate.getTime();
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (durationHours > 0) {
          duration = `ca. ${durationHours}h${durationMinutes > 0 ? ` ${durationMinutes}min` : ''}`;
        } else if (durationMinutes > 0) {
          duration = `ca. ${durationMinutes}min`;
        }
      }
    }
    
    // Generate numeric ID
    let eventIdNumber: number;
    if (typeof template._id === 'number') {
      eventIdNumber = template._id;
    } else if (typeof template._id === 'string') {
      const hash = template._id.split('').reduce((hash: number, char: string) => {
        return char.charCodeAt(0) + (hash << 6) + (hash << 16) - hash;
      }, 0);
      eventIdNumber = Math.abs(hash) % 1000000;
    } else {
      eventIdNumber = Math.floor(Math.random() * 1000000);
    }
    
    return {
      id: eventIdNumber,
      date: { day, month, year },
      title: template.name,
      venue: template.location || 'Petruschka Theater',
      location: template.location || 'Petruschka Theater', 
      time: time,
      dayOfWeek: dayOfWeek,
      description: description,
      ticketUrl: ticketUrl,
      // Enhanced fields from optimized view data
      longDescription: template.longDescription || '',
      shortDescription: template.shortDescription || '',
      artists: template.artists || '',
      flyerImagePath: template.flyerImagePath || '',
      bannerImagePath: template.bannerImagePath || '',
      eventDateString: eventDate.toLocaleDateString('de-DE', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      ticketTypes: ticketTypes,
      duration: duration,
      ageRecommendation: template.shortDescription?.match(/ab (\d+) Jahr/)?.[0] || '',
      importantNotes: template.importantNotes || ''
    };
  }

  /**
   * Clear stored data (useful for memory management)
   */
  clearData(): void {
    this.gigTemplatesSubject.next([]);
  }
}
