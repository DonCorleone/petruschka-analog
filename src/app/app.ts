import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styleUrls: ['../app.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
