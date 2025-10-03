import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  template: `
    <div class="not-found-container">
      <h1>404 - Page Not Found</h1>
      <p>The requested page could not be found.</p>
      <button (click)="goHome()" class="btn btn-primary">Go Home</button>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      text-align: center;
      padding: 2rem;
    }
    
    h1 {
      color: var(--primary-color);
      margin-bottom: 1rem;
    }
    
    p {
      margin-bottom: 2rem;
      color: rgba(255, 255, 255, 0.8);
    }
  `],
  standalone: true
})
export default class NotFoundPage implements OnInit {
  private router = inject(Router);
  private location = inject(Location);

  ngOnInit() {
    // If this is a request for a static asset, don't show 404 page
    const currentPath = this.location.path();
    if (currentPath.includes('/images/') || 
        currentPath.includes('/assets/') || 
        currentPath.includes('.jpg') || 
        currentPath.includes('.png') || 
        currentPath.includes('.svg') ||
        currentPath.includes('.ico') ||
        currentPath.includes('.css') ||
        currentPath.includes('.js') ||
        currentPath.includes('.well-known/')) {
      // This is likely a static asset request, redirect to prevent routing issues
      window.location.href = currentPath;
      return;
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}