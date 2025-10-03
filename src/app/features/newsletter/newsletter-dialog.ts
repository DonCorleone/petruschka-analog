import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

export interface NewsletterDialogData {
  // Add any data you want to pass to the dialog
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  privacy_consent: boolean;
}

@Component({
  selector: 'app-newsletter-dialog',
  templateUrl: './newsletter-dialog.html',
  styleUrls: ['./newsletter-dialog.css'],
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsletterDialogComponent {
  isSubmitting = false;
  submitSuccess = false;
  submitError: string | null = null;

  formData: FormData = {
    first_name: '',
    last_name: '',
    email: '',
    privacy_consent: false
  };

  constructor(
    private dialogRef: DialogRef<boolean>,
    @Inject(DIALOG_DATA) public data: NewsletterDialogData
  ) {}

  close(): void {
    this.dialogRef.close(false);
  }

  isFormValid(): boolean {
    return !!(
      this.formData.first_name.trim() &&
      this.formData.last_name.trim() &&
      this.formData.email.trim() &&
      this.formData.privacy_consent &&
      this.isValidEmail(this.formData.email)
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  resetForm(): void {
    this.submitError = null;
    this.submitSuccess = false;
    this.isSubmitting = false;
  }

  async submitHandler(event: Event): Promise<void> {
    event.preventDefault();
    
    if (!this.isFormValid()) {
      this.submitError = 'Bitte füllen Sie alle Pflichtfelder aus.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    try {
      const form = document.getElementById("newsletter-form") as HTMLFormElement;
      const formData = new FormData(form);

      // Submit to Netlify with no-cors mode to avoid CORS issues
      const response = await fetch("https://petruschka.netlify.app/", {
        method: "POST",
        mode: "no-cors", // This prevents CORS errors
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData as any).toString(),
      });

      // With no-cors mode, we can't check response.ok, so we assume success
      // since you confirmed the data is being saved in Netlify
      this.submitSuccess = true;
      this.isSubmitting = false;
      
      // Auto-close dialog after 3 seconds on success
      setTimeout(() => {
        this.dialogRef.close(true);
      }, 3000);
      
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      this.submitError = 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es später erneut.';
      this.isSubmitting = false;
    }
  }
}