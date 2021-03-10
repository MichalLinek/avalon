import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { ChatService } from '../chat.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(public auth: ChatService, public router: Router) {}
  canActivate(): boolean {
    if (!this.auth.getUserName()) {
      this.router.navigate(['']);
      return false;
    }
    return true;
  }
}