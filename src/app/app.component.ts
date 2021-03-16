import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from './chat.service';
import { Router } from '@angular/router';
import { UserGlobal } from './user-global.model';
import { NotificationService } from './services/notification.service';
import { MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'app';
  private subscription: ISubscription;
  public userName: UserGlobal;

  constructor(
    private chat: ChatService,
    private router: Router,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar) { }

  
  public ngOnInit(): void {
    this.subscription = this.notificationService.changeEmitted$.subscribe(x => {
      this.displayNotiifcation(x);
    });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public sendMessage(): void {
  }

  public getUserName(): string {
    return UserGlobal.userName;
  }

  public isUserNameChosen(): boolean {
    let userName = UserGlobal.userName;
    return !!userName;
  }
  
  public displayNotiifcation(notificationString: string) {
    let close = 'Close';
    this.snackBar.open(notificationString, close, {
      duration: 3000,
      verticalPosition: "top",
      horizontalPosition: "center"
    });
  }
}
