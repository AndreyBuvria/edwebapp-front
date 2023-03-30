import { AuthApi } from '../../features/auth/apis';
import { HttpErrorResponse } from '@angular/common/http';
import { UserType } from '@features/user';
import { AuthService } from '../../features/auth/services';
import { CookieService } from 'ngx-cookie-service';
import { Injectable } from '@angular/core';
import { Router, UrlTree, CanLoad, Route, UrlSegment } from '@angular/router';
import { map, Observable, switchMap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {

  constructor(
    private cookie: CookieService,
    private authService: AuthService,
    private authApiService: AuthApi,
    private router: Router) {}

  canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    //const path = route.routeConfig!.path;
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/', 'auth']);
      return false;
    }

    const path = route.data?.['role'];

    return this.checkAccess(path);
  }

  private checkAccess(path: string | undefined) {
    if (!path) return false;

    const accessToken = this.cookie.get('token_access');
    return this.authApiService.verifyUserRoleByToken(accessToken)
      .pipe(
        map((user: { role: UserType }) => user.role.toUpperCase() == path.toUpperCase()),
        catchError((requestError: HttpErrorResponse) => {
          if (accessToken.length === 0) {
            const refreshTypeToken = this.cookie.get('token_refresh');
            return this.authApiService.refreshToken(refreshTypeToken)
              .pipe(
                switchMap((accessToken: { access: string}) => {
                  this.authService.setAccessToken(accessToken.access);
                  return this.authApiService.verifyUserRoleByToken(accessToken.access)
                    .pipe(map((user: { role: UserType }) => user.role.toUpperCase() == path.toUpperCase()))
                })
              )
          } else {
            console.log(new Error(requestError.message));
            return of(false)
          }
        })
      )
  }

}
