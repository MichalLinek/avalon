import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  MainComponent,
  WelcomeComponent,
  SelectRoomComponent,
  CreateRoomComponent,
  WaitingRoomComponent,
  GameRoomComponent,
  EndGameComponent
} from './components/index';
import { 
  SocketService,
  NotificationService
} from './services/index';
import { WebSocketService } from './services/index';
import { MatInputModule } from '@angular/material/input';
import { 
  MatButtonModule,
  MatRadioModule,
  MatSliderModule,
  MatCheckboxModule,
  MatSelectModule,
  MatTableModule,
  MatListModule,
  MatCardModule,
  MatExpansionModule,
  MatSnackBarModule
} from '@angular/material';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogModule} from '@angular/material/dialog';
import { SafePipe } from './pipes/index';
import { 
  MissionVoteDialog,
  CompanionVoteDialog,
  ViewCardDialog,
  CreateRoomDialog
 } from "./dialog-components/index";
import { AuthGuard } from './helpers/index';
import { NavigationPaths } from './enums/index';

const routes: Routes = [
  { path: NavigationPaths.home, component: WelcomeComponent },
  { path: NavigationPaths.selectRoom, component: SelectRoomComponent, canActivate: [AuthGuard]},
  { path: NavigationPaths.createRoom, component: CreateRoomComponent, canActivate: [AuthGuard] },
  { path: NavigationPaths.waitingRoom, component: WaitingRoomComponent, canActivate: [AuthGuard]},
  { path: NavigationPaths.gameRoom, component : GameRoomComponent,  canActivate: [AuthGuard]},
  { path: NavigationPaths.endGame, component : EndGameComponent,  canActivate: [AuthGuard]}
];

@NgModule({
  declarations: [
    MainComponent,
    WelcomeComponent,
    SelectRoomComponent,
    CreateRoomComponent,
    WaitingRoomComponent,
    GameRoomComponent,
    EndGameComponent,
    MissionVoteDialog,
    CompanionVoteDialog,
    ViewCardDialog,
    CreateRoomDialog,
    SafePipe
  ],
  entryComponents: [
    MissionVoteDialog,
    CompanionVoteDialog,
    ViewCardDialog,
    CreateRoomDialog
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    FormsModule,
    BrowserAnimationsModule,
    [MatInputModule, MatButtonModule, MatSliderModule, MatSelectModule, MatCheckboxModule, 
      MatDialogModule, MatTableModule, MatRadioModule, MatListModule, MatCardModule, MatExpansionModule, MatSnackBarModule]
  ],
  providers: [
    SocketService,
    WebSocketService,
    AuthGuard,
    NotificationService
  ],
  exports: [RouterModule],
  bootstrap: [MainComponent]
})
export class AppModule { }
