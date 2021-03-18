import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Campaign, CharacterCard } from '../../models/game';

@Component({
  selector: 'create-room-dialog',
  templateUrl: './create-room-dialog.component.html',
  styleUrls: ['./create-room-dialog.component.css']
})
export class CreateRoomDialog  {
  public campaign : Campaign;
  public specialCharacters: CharacterCard[];

  constructor(
    public dialogRef: MatDialogRef<CreateRoomDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.campaign = data.campaign;
      this.specialCharacters = data.specialCharacters;
    }

    public getCharacterCardName(characterId: number) {
      return this.specialCharacters.find(x => x.id === characterId).name;
    }

    public onCreate(): void {
      this.dialogRef.close(true);
    }

    public onCancel(): void {
      this.dialogRef.close(false);
    }
}
