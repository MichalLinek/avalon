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
import { MatButtonModule, MatRadioModule, MatSliderModule, MatCheckboxModule, MatSelectModule, MatTableModule, MatListModule, MatCardModule, MatExpansionModule } from '@angular/material';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogModule} from '@angular/material/dialog';
import { SafePipe } from './pipes/SafePipe';
import { MissionVoteDialog } from './mission-vote-dialog/mission-vote-dialog.component';
import { CompanionVoteDialog } from './companion-vote.dialog/companion-vote-dialog.component';
import { AuthGuard } from './helpers/auth-guard';

const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'selectRoom', component: SelectRoomComponent, canActivate: [AuthGuard]},
  { path: 'createRoom', component: CreateRoomComponent, canActivate: [AuthGuard] },
  { path: 'waitingRoom', component: WaitingRoomComponent, canActivate: [AuthGuard]},
  { path: 'gameRoom', component : GameRoomComponent,  canActivate: [AuthGuard]}
];

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    SelectRoomComponent,
    CreateRoomComponent,
    WaitingRoomComponent,
    GameRoomComponent,
    MissionVoteDialog,
    CompanionVoteDialog,
    SafePipe
  ],
  entryComponents: [
    MissionVoteDialog,
    CompanionVoteDialog
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    FormsModule,
    BrowserAnimationsModule,
    [MatInputModule, MatButtonModule, MatSliderModule, MatSelectModule, MatCheckboxModule, 
      MatDialogModule, MatTableModule, MatRadioModule, MatListModule, MatCardModule, MatExpansionModule]
  ],
  providers: [
    ChatService,
    WebSocketService,
    AuthGuard
  ],
  exports: [RouterModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
