import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Subscription } from 'rxjs';
import { DialogService } from '../../core/services/dialog.service';
import { Location, ApiResponse } from '../../../shared/types';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5 mb-5 loading-placeholder">
      <div class="d-flex justify-content-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  `
})
export default class LocationDetailPageComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private dialogService = inject(DialogService);
  private http = inject(HttpClient);
  private subscription = new Subscription();
  
  async ngOnInit(): Promise<void> {
    this.titleService.setTitle('Location Details');
    
    try {
      // Extract location name from URL parameter using ActivatedRoute
      const locationNameSlug = this.route.snapshot.paramMap.get('name');
      
      if (!locationNameSlug) {
        throw new Error('Location name not found in URL');
      }

      // Attempt multiple strategies to find the location
      await this.loadLocationBySlug(locationNameSlug);

    } catch (error) {
      console.error('Failed to load location details:', error);
      
      // Navigate to fallback route after a delay
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 500);
    }
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  private async loadLocationBySlug(slug: string): Promise<void> {
    try {
      // First attempt: Direct API call with the slug
      const slugResult = await this.tryLoadLocation(slug);
      if (slugResult) return;
      
      // Second attempt: Convert slug back to a human-readable name
      const humanName = this.slugToHumanName(slug);
      const humanNameResult = await this.tryLoadLocation(humanName);
      if (humanNameResult) return;
      
      // Third attempt: Try common venue names from the system
      const commonVenues = [
        'Petruschka Theater',
        'Petruschka-Theater',
        'Petruschka'
      ];
      
      for (const venue of commonVenues) {
        const commonResult = await this.tryLoadLocation(venue);
        if (commonResult) return;
      }
      
      throw new Error('Location not found with any attempt');
      
    } catch (error) {
      console.error('Location loading strategies failed:', error);
      throw error;
    }
  }
  
  private async tryLoadLocation(name: string): Promise<boolean> {
    try {
      const encodedName = encodeURIComponent(name);
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Location>>(`/api/v1/location/${encodedName}`)
      );
      
      if (response.success && response.data) {
        // Found the location! Open the dialog
        await this.dialogService.openLocationDetail(response.data.name);
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn(`Failed to load location with name "${name}":`, error);
      return false;
    }
  }
  
  private slugToHumanName(slug: string): string {
    // Convert kebab-case to spaces and handle German characters
    return slug
      .replace(/-/g, ' ')
      .replace(/ae/g, 'ä')
      .replace(/oe/g, 'ö')
      .replace(/ue/g, 'ü')
      // Capitalize words
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}