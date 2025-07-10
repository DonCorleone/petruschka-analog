import { Component, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NavLink {
  href: string;
  label: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  
  private scrolled = signal(false);
  private navbarOpen = signal(false);

  navLinks: NavLink[] = [
    { href: '#promo', label: 'Home' },
    { href: '#gigs', label: 'Gigs' },
    { href: '#music', label: 'Music' },
    { href: '#about', label: 'About' },
    { href: '#merch', label: 'Merch' },
    { href: '#contact', label: 'Contact' }
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
