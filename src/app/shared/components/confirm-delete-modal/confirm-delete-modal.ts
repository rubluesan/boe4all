import { Component, HostListener, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-confirm-delete-modal',
  imports: [FormsModule, LucideAngularModule, A11yModule],
  templateUrl: './confirm-delete-modal.html',
  styleUrl: './confirm-delete-modal.css',
})
export class ConfirmDeleteModal {
  title = input<string>('¿Eliminar elemento?');
  description = input<string>('Esta acción no se puede deshacer.');
  requireConfirmText = input<boolean>(false);
  dangerLabel = input<string>('Eliminar');

  onConfirm = output<void>();
  onCancel = output<void>();

  readonly confirmWord = 'eliminar';
  userInput = '';
  isTypingConfirmed = signal(false);

  canConfirm = computed(() => !this.requireConfirmText() || this.isTypingConfirmed());

  @HostListener('document:keydown.escape')
  onEscape() {
    this.onCancel.emit();
  }

  checkInput() {
    this.isTypingConfirmed.set(this.userInput.toLowerCase().trim() === this.confirmWord);
  }
}
