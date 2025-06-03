import { NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http"
import { AuthInterceptor } from "./interceptors/auth.interceptor"
// import { AuthInterceptor } from "./interceptors/auth.interceptor"

@NgModule({
  declarations: [],
  imports: [BrowserModule, HttpClientModule],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [],
})
export class AppModule {}
