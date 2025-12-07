import { Component, signal, HostListener, ChangeDetectionStrategy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-back-to-top',
  imports: [CommonModule],
  templateUrl: './back-to-top.html',
  styleUrls: ['./back-to-top.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackToTopComponent {

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private visible = signal(false);

  isVisible = this.visible.asReadonly();

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isBrowser) return;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.visible.set(scrollTop > 300);
  }

  scrollToTop() {
    if (!this.isBrowser) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
