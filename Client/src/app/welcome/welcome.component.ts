import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit, OnDestroy {

  userName: string;

  constructor(private chat: ChatService, private router: Router) { }

  ngOnInit() {
  }

  goToRoomSelection() {
    this.chat.setUserName(this.userName);
    this.router.navigate(['selectRoom']);
  }

  ngOnDestroy() {
  }
}
