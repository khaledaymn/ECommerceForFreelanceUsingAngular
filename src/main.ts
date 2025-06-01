import { bootstrapApplication } from "@angular/platform-browser"
import { provideRouter } from "@angular/router"
import { provideHttpClient } from "@angular/common/http"
import { AppComponent } from "./app/app.component"
import { routes } from "./app/app.routes"
import { LOCALE_ID } from "@angular/core"
import { registerLocaleData } from "@angular/common"
import localeAr from "@angular/common/locales/ar"

// Register Arabic locale
registerLocaleData(localeAr, "ar")

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), provideHttpClient(), { provide: LOCALE_ID, useValue: "ar" }],
}).catch((err) => console.error(err))
