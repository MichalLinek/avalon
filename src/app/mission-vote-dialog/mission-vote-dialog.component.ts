import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface DialogData {
  VoteFor? : boolean;
  Character: any
}
@Component({
  selector: 'app-mission-vote-dialog',
  templateUrl: './mission-vote-dialog.component.html',
  styleUrls: ['./mission-vote-dialog.component.css']
})
export class MissionVoteDialog  {
  selectedOption : string;
  options: string[] = ['Success'];

  constructor(
    public dialogRef: MatDialogRef<MissionVoteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      if (this.playerIsEvil()) {
        this.options.push('Failure');
      }
    }

    playerIsEvil(): boolean {
      return this.data.Character.Alignment === "Evil";
    }
  onNoClick(): void {
    if (this.selectedOption) {
      this.data.VoteFor = this.selectedOption === 'Success'; 
    }
    this.dialogRef.close(this.data.VoteFor);
  }
}
