import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { NavigationPaths } from '../enums/index';
import { UserGlobal } from '../globals/index';
import { SocketService } from '../services/index';

@Injectable()
export class AuthGuard implements CanActivate {
  
  constructor(public auth: SocketService, public router: Router) {}

  public canActivate(): boolean {
    if (!UserGlobal.userName) {
      this.router.navigate([NavigationPaths.home]);
      return false;
    }
    return true;
  }
}