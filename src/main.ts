import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import { appConfig } from './app/app.config';

// Register Arabic locale
registerLocaleData(localeAr, 'ar');

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
