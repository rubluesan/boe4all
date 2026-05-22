import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SystemMessageService {
  messageArray = signal<{ id: number; errorCode: string; text: string; isError: boolean }[]>([]);
  isError = signal(false);

  showMessage(msg: string, error = false, errCode: string = '') {
    this.messageArray.update((arr) => {
      // Si ya existe, devolvemos el array intacto (no se añade el duplicado)
      if (errCode && arr.some((item) => item.errorCode === errCode)) {
        return arr;
      }

      return [...arr, { id: Date.now(), errorCode: errCode, text: msg, isError: error }];
    });
  }

  removeMessage(id: number) {
    this.messageArray.update((arr) => arr.filter((item) => item.id !== id));
  }
}
