import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { ChatService } from '../chat.service';
import { UserGlobal } from '../user-global.model';
import { NavigationPaths } from './navigation-paths';

@Injectable()
export class AuthGuard implements CanActivate {
  
  constructor(public auth: ChatService, public router: Router) {}

  public canActivate(): boolean {
    if (!UserGlobal.userName) {
      this.router.navigate([NavigationPaths.home]);
      return false;
    }
    return true;
  }
}