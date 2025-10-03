import { Component, signal, HostListener, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NavLink {
  href: string;
  label: string;
}

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  
  private scrolled = signal(false);
  private navbarOpen = signal(false);

  navLinks: NavLink[] = [
    { href: '#promo', label: 'Home' },
    { href: '#gigs', label: 'Aufführungen' },
    { href: '#music', label: 'Hörspiele' },
    { href: '#about', label: 'Team' },
    { href: '#schueleraufführungen', label: 'Schüleraufführungen' },
    { href: '#merch', label: 'Wandertheater' },
    { href: '#history', label: 'Vergangene Stücke' },
    { href: '#contact', label: 'Über uns' }
  ];

  isScrolled = this.scrolled.asReadonly();
  isNavbarOpen = this.navbarOpen.asReadonly();

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.scrollY;
    this.scrolled.set(scrollTop > 0);
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    // Close navbar on resize
    if (window.innerWidth >= 768 && this.navbarOpen()) {
      this.navbarOpen.set(false);
    }
  }

  toggleNavbar() {
    this.navbarOpen.update(open => !open);
  }

  scrollToSection(event: Event, href: string) {
    event.preventDefault();
    
    const element = document.querySelector(href);
    if (!element) return;

    const yOffset = 51; // header height
    const y = element.getBoundingClientRect().top + window.pageYOffset - yOffset;
    
    window.scrollTo({ top: y, behavior: 'smooth' });
    
    // Close mobile menu after clicking
    this.navbarOpen.set(false);
  }
}
