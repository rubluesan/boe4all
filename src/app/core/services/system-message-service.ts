import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SystemMessageService {
  toastMessage = signal<{ text: string; isError: boolean } | null>(null);

  message = signal('');
  isError = signal(false);

  showMessage(msg: string, error = false) {
    this.message.set(msg);
    this.isError.set(error);
  }

  clear() {
    this.message.set('');
  }
}
