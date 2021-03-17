import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ChatService } from './chat.service';
import { WebSocketService } from './web-socket.service';
import { WelcomeComponent } from './welcome/welcome.component';
import { SelectRoomComponent } from './select-room/select-room.component';
import { CreateRoomComponent } from './create-room/create-room.component';
import { WaitingRoomComponent} from './waiting-room/waiting-room.component';
import { GameRoomComponent } from './game-room/game-room.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule, MatRadioModule, MatSliderModule, MatCheckboxModule, MatSelectModule, MatTableModule, MatListModule, MatCardModule, MatExpansionModule, MatSnackBarModule } from '@angular/material';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogModule} from '@angular/material/dialog';
import { SafePipe } from './pipes/SafePipe';
import { MissionVoteDialog } from './mission-vote-dialog/mission-vote-dialog.component';
import { CompanionVoteDialog } from './companion-vote.dialog/companion-vote-dialog.component';
import { AuthGuard } from './helpers/auth-guard';
import { NavigationPaths } from './helpers/navigation-paths';
import { ViewCardDialog } from './view-card-dialog/view-card-dialog.component';
import { NotificationService } from './services/notification.service';
import { CreateRoomDialog } from './create-room-dialog/create-room-dialog.component';
import { EndGameComponent } from './end-game/end-game.component';

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
    AppComponent,
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
    ChatService,
    WebSocketService,
    AuthGuard,
    NotificationService
  ],
  exports: [RouterModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
