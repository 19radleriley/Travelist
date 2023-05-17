import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpXsrfTokenExtractor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {

  constructor( 
    private tokenExtractor : HttpXsrfTokenExtractor
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const cookieheaderName = "X-CSRF"
    let csrfToken = this.tokenExtractor.getToken() as string;
    if (csrfToken != null && !request.headers.has(cookieheaderName)) {
      request = request.clone({
        headers : request.headers.set(cookieheaderName, csrfToken)
      });
    }

    return next.handle(request);
  }
}
