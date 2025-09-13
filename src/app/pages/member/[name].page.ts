import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../core/services/dialog.service';
import { BandDataService } from '../../core/services';
import { BandMember } from '../../../shared/types';

@Component({
  selector: 'app-member-detail-page',
  imports: [CommonModule],
  template: `
    <!-- This page exists for SEO and deep linking -->
    <!-- The actual content is shown in the dialog overlay -->
    <div class="loading-container">
      <p>Loading member details...</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class MemberDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private bandDataService = inject(BandDataService);

  async ngOnInit(): Promise<void> {
    const memberName = this.route.snapshot.paramMap.get('name');
    
    if (memberName) {
      try {
        // Format the memberName back to proper format from URL
        const formattedName = this.formatNameFromUrl(memberName);
        
        // Try to find the member and open the dialog
        const bandMembers = this.bandDataService.bandMembersResource.value() || [];
        
        // First try exact match
        let member = bandMembers.find(m => 
          this.formatNameForUrl(m.name) === memberName.toLowerCase()
        );
        
        // Then try case-insensitive match if no exact match
        if (!member) {
          member = bandMembers.find(m => 
            this.formatNameForUrl(m.name).toLowerCase() === memberName.toLowerCase()
          );
        }
        
        // Then try contains match if still no match
        if (!member && bandMembers.length > 0) {
          member = bandMembers.find(m => 
            m.name.toLowerCase().includes(formattedName.toLowerCase()) ||
            formattedName.toLowerCase().includes(m.name.toLowerCase())
          );
        }
        
        if (member) {
          // Open the dialog overlay and get the dialog reference
          const dialogRef = this.dialogService.openMemberBio(member);
          
          // If successful, subscribe to dialog closing and navigate to home
          // This prevents blank page in private browsing mode
          if (dialogRef) {
            dialogRef.closed.subscribe(() => {
              // Navigate to homepage when dialog is closed
              this.router.navigate(['/']);
            });
          }
        } else {
          // If we couldn't find the member, check if we need to load data
          // This happens when the page is accessed directly (deeplink)
          if (bandMembers.length === 0) {
            console.log('No band members available, trying to load data...');
            
            // Wait briefly then retry with whatever data might be available now
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Try again after waiting
            const refreshedMembers = this.bandDataService.bandMembersResource.value() || [];
            
            // Try all match approaches again
            member = refreshedMembers.find(m => 
              this.formatNameForUrl(m.name) === memberName.toLowerCase()
            );
            
            if (!member) {
              member = refreshedMembers.find(m => 
                this.formatNameForUrl(m.name).toLowerCase() === memberName.toLowerCase()
              );
            }
            
            if (!member && refreshedMembers.length > 0) {
              member = refreshedMembers.find(m => 
                m.name.toLowerCase().includes(formattedName.toLowerCase()) ||
                formattedName.toLowerCase().includes(m.name.toLowerCase())
              );
            }
            
            if (member) {
              // Open the dialog overlay and get the dialog reference
              const dialogRef = this.dialogService.openMemberBio(member);
              
              // If successful, subscribe to dialog closing and navigate to home
              if (dialogRef) {
                dialogRef.closed.subscribe(() => {
                  // Navigate to homepage when dialog is closed
                  this.router.navigate(['/']);
                });
              }
              return;
            }
          }
          
          // Member not found, redirect to home
          console.error('Band member not found:', formattedName);
          this.router.navigate(['/']);
        }
      } catch (error) {
        console.error('Error opening member dialog:', error);
        this.router.navigate(['/']);
      }
    } else {
      // No member name, redirect to home
      this.router.navigate(['/']);
    }
  }
  
  // Helper method to format names for URL
  private formatNameForUrl(name: string): string {
    if (!name) return '';
    
    return name.toLowerCase()
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
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
  }
  
  // Helper method to format URL back to name
  private formatNameFromUrl(urlName: string): string {
    if (!urlName) return '';
    
    // Simple conversion back - replace hyphens with spaces and capitalize words
    return urlName
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}