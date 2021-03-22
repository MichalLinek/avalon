import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Player } from '../../models/game/index';

export interface DialogData {
  players: Player[]
}

@Component({
  selector: 'app-companion-vote-dialog',
  templateUrl: './companion-vote-dialog.component.html',
  styleUrls: ['./companion-vote-dialog.component.css']
})
export class CompanionVoteDialog {
  public players : Player[];

  constructor(
    public dialogRef: MatDialogRef<CompanionVoteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      this.players = data.players;
    }

  public onAgree(): void {
    this.dialogRef.close(true);
  }

  public onDisagree(): void {
    this.dialogRef.close(false);
  }
}
