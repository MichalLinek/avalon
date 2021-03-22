import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CharacterCard } from '../../models/game/index';

export interface DialogData {
  characterCard: CharacterCard
}

@Component({
  selector: 'view-card-dialog',
  templateUrl: './view-card-dialog.component.html',
  styleUrls: ['./view-card-dialog.component.css']
})
export class ViewCardDialog  {
  public characterCard : CharacterCard;
  public imageUrl: string;

  constructor(
    public dialogRef: MatDialogRef<ViewCardDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      this.characterCard = data.characterCard;
      this.imageUrl = this.getImageUrl();
    }

    public getImageUrl(): string {
      return this.characterCard.imageUrl;
    }

    public onClose(): void {
      this.dialogRef.close();
    }
}
