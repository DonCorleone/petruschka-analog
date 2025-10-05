import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { BaseDialogComponent } from '../../core/components/base-dialog.component';
import { DialogInfoSectionComponent } from '../../core/components/dialog-info-section.component';
import { DialogTwoColumnComponent } from '../../core/components/dialog-two-column.component';
import { Location } from '../../../shared/types';

export interface LocationDialogData {
  location: Location;
}

@Component({
  selector: 'app-location-dialog',
  imports: [
    CommonModule, 
    BaseDialogComponent, 
    DialogInfoSectionComponent, 
    DialogTwoColumnComponent
  ],
  templateUrl: './location-dialog.html',
  styleUrls: ['./location-dialog.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationDialogComponent {
  public data = inject(DIALOG_DATA) as LocationDialogData;

  getGoogleMapsUrl(): string {
    const address = `${this.data.location.street}, ${this.data.location.postalCode} ${this.data.location.city}`;
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  }

  getLocationImageUrl(): string {
    const locationName = encodeURIComponent(this.data.location.name).toLowerCase();
    console.log(locationName);
    return `https://petruschka.netlify.app/.netlify/images?url=https://petruschka-analog-mongo.onrender.com/images/staff/${locationName}.jpg&nf_resize=fit&w=538`;
  }
}
