import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlignmentType } from '../../common/constants/Enums/AlignmentType';
import { MissionResultType } from '../../common/constants/Enums/MissionResultType';
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
  selectedOptionId : number;
  options: string[] = ['Success'];

  constructor(
    public dialogRef: MatDialogRef<MissionVoteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      if (this.playerIsEvil()) {
        this.options.push('Failure');
      }
    }

  public playerIsEvil(): boolean {
    return this.data.character.alignment === AlignmentType.Evil;
  }

  public onNoClick(): void {
    this.data.voteFor = this.selectedOptionId === MissionResultType.Success.valueOf(); 
    this.dialogRef.close(this.data.voteFor);
  }
}
