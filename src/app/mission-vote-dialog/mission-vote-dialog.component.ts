import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlignmentType } from '../../common/constants/Enums/AlignmentType';
import { CharacterCard } from '../../common/db/CharacterCard';

export interface DialogData {
  voteFor? : boolean;
  character: CharacterCard
}

@Component({
  selector: 'app-mission-vote-dialog',
  templateUrl: './mission-vote-dialog.component.html',
  styleUrls: ['./mission-vote-dialog.component.css']
})
export class MissionVoteDialog  {
  public selectedOptionId : number;
  public isCharacterEvil: boolean;
  constructor(
    public dialogRef: MatDialogRef<MissionVoteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      this.isCharacterEvil = this.data.character.alignment === AlignmentType.Evil;
    }

  public onSuccess(): void {
    this.dialogRef.close(true);
  }

  public onFailure(): void {
    this.dialogRef.close(false);
  }
}
