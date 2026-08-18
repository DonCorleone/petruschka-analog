import { Directive, ElementRef, Input, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appAnimateOnScroll]',
  standalone: true
})
export class AnimateOnScrollDirective implements OnInit, OnDestroy {
  @Input() animationDelay = 0;
  @Input() animationThreshold = 0.1;

  private observer: IntersectionObserver | null = null;
  private elementRef = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // On server, make elements visible immediately
      this.elementRef.nativeElement.classList.add('animate-visible');
      return;
    }

    // Add the base class for initial state
    this.elementRef.nativeElement.classList.add('animate-on-scroll');

    // Apply custom delay if specified
    if (this.animationDelay > 0) {
      this.elementRef.nativeElement.style.transitionDelay = `${this.animationDelay}ms`;
    }

    // Create intersection observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
            // Unobserve after animation triggers (one-time animation)
            this.observer?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: this.animationThreshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
