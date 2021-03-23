import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationPaths } from '../../enums';
import { UserGlobal } from '../../globals';

@Component({
  selector: 'end-game',
  templateUrl: './end-game.component.html',
  styleUrls: ['./end-game.component.css']
})
export class EndGameComponent {
  public win: boolean = false;

  constructor(private router: Router) {
    this.win = UserGlobal.win;
  }

  public goBack() {
    UserGlobal.win = null;
    UserGlobal.room = null;
    this.router.navigate([NavigationPaths.selectRoom]);
  }
}
