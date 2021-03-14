import { Component, OnInit } from '@angular/core';
import { ChatService } from './chat.service';
import { Router } from '@angular/router';
import { UserGlobal } from './user-global.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  constructor(private chat: ChatService, private router: Router) { }

  public ngOnInit(): void {
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
}
