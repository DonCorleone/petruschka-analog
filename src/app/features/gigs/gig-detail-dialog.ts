import { Component, Inject, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { DialogService } from '../../core/services/dialog.service';
import { BandDataService } from '../../core/services';
import { Gig, BandMember } from '../../../shared/types';

export interface GigDetailData {
  gig: Gig;
  isHistoryEvent?: boolean;
}

@Component({
  selector: 'app-gig-detail-dialog',
  imports: [CommonModule],
  templateUrl: './gig-detail-dialog.html',
  styleUrls: ['./gig-detail-dialog.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GigDetailDialogComponent implements OnInit {
  public dialogRef = inject(DialogRef<boolean>);
  public data = inject(DIALOG_DATA) as GigDetailData;
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private bandDataService = inject(BandDataService);
  
  // Band members data for matching artists
  private bandMembers = this.bandDataService.bandMembersResource.value;
  
  // Signal for grouped artists
  artistGroups = signal<{role: string, names: string[]}[]>([]);
  
  ngOnInit() {
    // Set the signal value on initialization
    this.artistGroups.set(this._calculateGroupedArtists());
  }

  close(): void {
    this.dialogRef.close();
  }

  openLocationDialog(locationName: string): void {
    if (locationName && locationName !== '#') {
      this.dialogService.openLocationDetail(locationName);
    }
  }
  
  /**
   * Parse artists string into a structured format
   * Handles various formats like:
   * - Simple comma-separated names
   * - Role-based with colons "Role: Name"
   * - Multiple entries separated by pipes or newlines
   */
  public parseArtists(): Array<{role: string, name: string}> {
    if (!this.data.gig.artists) return [];
    
    const result: Array<{role: string, name: string}> = [];
    
    // First split by newline, then by pipe symbol
    const entries = this.data.gig.artists
      .split(/\n/)
      .flatMap(line => line.split(/\s*\|\s*/))
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);
    
    for (const entry of entries) {
      // Check if entry has a role format (Role: Name)
      if (entry.includes(':')) {
        const [role, namesPart] = entry.split(':').map(part => part.trim());
        
        // Handle multiple names per role (separated by commas, ampersands, or 'und')
        const names = namesPart
          .split(/\s*(?:&|,|und)\s*/)
          .map(name => name.trim())
          .filter(name => name.length > 0);
        
        for (const name of names) {
          result.push({ role, name });
        }
      } else {
        // Simple name without role - assume "Mitwirkende" as default role
        // Also handle multiple names separated by commas or ampersands
        const names = entry
          .split(/\s*(?:&|,|und)\s*/)
          .map(name => name.trim())
          .filter(name => name.length > 0);
        
        for (const name of names) {
          result.push({ role: 'Mitwirkende', name });
        }
      }
    }
    
    return result;
  }

  /**
   * Private method to calculate grouped artists
   */
  private _calculateGroupedArtists(): {role: string, names: string[]}[] {
    const artists = this.parseArtists();
    const groupedMap = new Map<string, string[]>();
    
    // Group names by role
    for (const artist of artists) {
      if (!groupedMap.has(artist.role)) {
        groupedMap.set(artist.role, []);
      }
      groupedMap.get(artist.role)?.push(artist.name);
    }
    
    // Convert map to array of objects for template iteration
    const result: {role: string, names: string[]}[] = [];
    groupedMap.forEach((names, role) => {
      result.push({ role, names });
    });
    
    return result;
  }
  
  /**
   * Public method used in template to access grouped artists
   */
  public getGroupedArtists(): {role: string, names: string[]}[] {
    return this.artistGroups();
  }
  
  /**
   * Format artists as HTML for template
   */
  public formatArtistsHtml(): string {
    if (!this.data.gig.artists) return '';
    
    const artists = this.parseArtists();
    // Group by role
    const groupedMap = new Map<string, string[]>();
    
    for (const artist of artists) {
      if (!groupedMap.has(artist.role)) {
        groupedMap.set(artist.role, []);
      }
      groupedMap.get(artist.role)?.push(artist.name);
    }
    
    // Build HTML string
    let html = '';
    
    groupedMap.forEach((names, role) => {
      html += `<div class="artist-role-group">`;
      html += `<span class="role-name">${role}:</span>`;
      html += `<div class="role-members">`;
      
      for (const name of names) {
        // Can't handle click events in innerHTML, so we'll use plain styling
        html += `<div class="artist-item">`;
        html += `<span>${name}</span>`;
        html += `</div>`;
      }
      
      html += `</div></div>`;
    });
    
    return html;
  }

  /**
   * Check if an artist name matches any band member
   */
  isTeamMember(artistName: string): boolean {
    if (!artistName) return false;
    
    const members = this.bandMembers();
    if (!members || members.length === 0) return false;
    
    return members.some(member => member.name === artistName);
  }
  
  /**
   * Open member bio dialog when clicking on a team member's name
   */
  openMemberBio(artistName: string): void {
    if (!artistName) return;
    
    // Find the matching band member
    const members = this.bandMembers();
    if (!members || members.length === 0) return;
    
    const member = members.find(m => m.name === artistName);
    
    if (member) {
      this.dialogService.openMemberBio(member);
    }
  }
}
