import { AuthService } from 'src/app/shared/services/auth.service';
import { Injectable } from '@angular/core';
import { UrlTree, CanLoad, Route, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoggedInGuard implements CanLoad {

  constructor(private auth: AuthService) {}
  canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.auth.isLoggedIn() ? false : true;
  }

}
