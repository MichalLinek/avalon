import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';
import { MessageType } from '../../../../Common/constants/Enums/MessageType';
import { ISubscription } from 'rxjs/Subscription';
import { UserValidResponse } from '../../../../Common/responses/user-valid-reponse.model';
import { NavigationPaths } from '../helpers/navigation-paths';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit, OnDestroy {

  public userName: string;
  private subscription: ISubscription;
  public error: boolean;
  
  constructor(private chat: ChatService, private router: Router) { }

  public ngOnDestroy(): void {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

  public ngOnInit(): void {
    this.subscription = this.chat.messages.subscribe((msg: UserValidResponse) => {
      if (msg.type === MessageType.SET_USERNAME) {
        if (msg.isUserValid) {
          this.router.navigate([NavigationPaths.selectRoom]);
        }
        else {
          this.error = true;
        }
      }
    }), (error) => console.log('Error' + error);
  }

  public setUserName(): void {
    this.chat.setUserName(this.userName);
  }
}
