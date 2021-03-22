import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { ISubscription } from 'rxjs/Subscription';
import { NotificationService, SocketService } from '../../services/index';
import { UserGlobal } from '../../globals/index';

@Component({
  selector: 'main-root',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {
  title = 'app';
  private subscription: ISubscription;

  constructor(
    private chat: SocketService,
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
    return UserGlobal ? UserGlobal.userName : "";
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
