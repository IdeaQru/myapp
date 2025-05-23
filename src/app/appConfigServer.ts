// src/app/app-config.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  public apiUrl: string;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.apiUrl = window.location.origin;
    } else {
      // Default saat server-side rendering, bisa disesuaikan
      this.apiUrl = 'http://localhost:3000';
    }
  }
}
