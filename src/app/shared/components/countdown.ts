import { Component, Input, signal, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown.html',
  styleUrls: ['./countdown.css']
})
export class CountdownComponent implements OnInit, OnDestroy {
  
  @Input() targetDate!: string;
  
  private timeLeftSignal = signal<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  private intervalId?: number;
  private platformId = inject(PLATFORM_ID);
  
  timeLeft = this.timeLeftSignal.asReadonly();

  ngOnInit() {
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startCountdown() {
    // Exit early if not in browser environment (SSR)
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const targetTime = new Date(this.targetDate).getTime();
    
    this.updateCountdown(targetTime);
    
    this.intervalId = window.setInterval(() => {
      this.updateCountdown(targetTime);
    }, 1000);
  }

  private updateCountdown(targetTime: number) {
    const currentTime = new Date().getTime();
    const secondsLeft = Math.max(0, (targetTime - currentTime) / 1000);
    
    const days = Math.floor(secondsLeft / 86400);
    const hours = Math.floor((secondsLeft % 86400) / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = Math.floor(secondsLeft % 60);
    
    this.timeLeftSignal.set({ days, hours, minutes, seconds });
  }
}
