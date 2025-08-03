import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Location } from '../../../shared/types';

export interface LocationDialogData {
  location: Location;
}

@Component({
  selector: 'app-location-dialog',
  imports: [CommonModule],
  templateUrl: './location-dialog.html',
  styleUrls: ['./location-dialog.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationDialogComponent {
  public dialogRef = inject(DialogRef<boolean>);
  public data = inject(DIALOG_DATA) as LocationDialogData;

  close(): void {
    this.dialogRef.close();
  }

  getGoogleMapsUrl(): string {
    const address = `${this.data.location.street}, ${this.data.location.postalCode} ${this.data.location.city}`;
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  }

  getLocationImageUrl(): string {
    const locationName = encodeURIComponent(this.data.location.name);
    return `https://www.petruschka.ch/assets/images/staff/${locationName}.jpg?nf_resize=fit&w=538`;
  }
}
