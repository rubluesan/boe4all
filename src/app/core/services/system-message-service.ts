import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SystemMessageService {
  messageArray = signal<{ id: number; text: string; isError: boolean }[]>([]);
  isError = signal(false);

  showMessage(msg: string, error = false) {
    this.messageArray.update((arr) => [...arr, { id: Date.now(), text: msg, isError: error }]);
  }

  removeMessage(id: number) {
    this.messageArray.update((arr) => arr.filter((item) => item.id !== id));
  }
}
