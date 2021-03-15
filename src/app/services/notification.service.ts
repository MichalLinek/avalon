import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class NotificationService {
    private emitChangeSource = new Subject<string>();
    public changeEmitted$ = this.emitChangeSource.asObservable();
    
    public emitChange(notificationString: string) {
        this.emitChangeSource.next(notificationString);
    }
}