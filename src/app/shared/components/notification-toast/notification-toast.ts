import { Component, input, output, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-notification-toast',
  imports: [LucideAngularModule],
  templateUrl: './notification-toast.html',
  styleUrl: './notification-toast.css',
})
export class NotificationToast {
  message = input('');
  isError = input(false);

  onClose = output<void>();
  isLeaving = signal(false);

  ngOnInit() {
    setTimeout(() => {
      this.startExit();
    }, 4000);
  }

  private startExit() {
    this.isLeaving.set(true);
    setTimeout(() => {
      this.onClose.emit();
    }, 300);
  }
}
